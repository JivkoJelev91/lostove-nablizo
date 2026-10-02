import { File } from 'expo-file-system';

import { getCurrentUserId } from '@/features/auth/current-user';
import { isLocalPhoto, isStoredPhoto } from '@/features/photos/types';
import type { DraftPhoto, LocalPhoto } from '@/features/photos/types';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';

/** One photo that failed to upload, with the reason to report. */
export type PhotoUploadFailure = {
  uri: string;
  message: string;
};

export type PhotoUploadResult = {
  rows: Tables<'photos'>[];
  failed: PhotoUploadFailure[];
};

/** Where a batch got to, reported before the first upload and after every photo. */
export type PhotoUploadProgress = {
  completed: number;
  total: number;
};

export type PhotoUploadOptions = {
  onProgress?: (progress: PhotoUploadProgress) => void;
};

const PHOTO_BUCKET = 'photos';
const PHOTO_CONTENT_TYPE = 'image/jpeg';

/** A year: object keys are unique, so a stored photo never changes under the same URL. */
const PHOTO_CACHE_CONTROL_S = '31536000';

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/**
 * The object key for one upload: the owner's folder, the spot's folder, then a unique name.
 *
 * The owner folder is what the Storage policies check, so it is not cosmetic. A fresh name per
 * upload is what keeps an object immutable: replacing a photo is a delete and an insert, never an
 * overwrite, so no cache ever has to be invalidated.
 */
function objectKey(userId: string, spotId: string): string {
  const unique = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  return `${userId}/${spotId}/${unique}.jpg`;
}

/**
 * The file's bytes, read off the device.
 *
 * `File` rather than `fetch`: React Native's fetch cannot read local `file://` URIs, and a
 * prepared photo always lives on disk, so the upload failed before a single byte left the phone.
 * The file-system module reads the same URI the picker and the manipulator produced.
 */
async function readBytes(uri: string): Promise<Uint8Array> {
  const bytes = await new File(uri).bytes();

  if (bytes.byteLength === 0) {
    throw new Error('The photo file is empty.');
  }

  return bytes;
}

/**
 * Uploads one prepared photo and records its metadata.
 *
 * The object goes up first and the row second, because the row names the object. A failed insert
 * therefore removes the object again: an orphan in the bucket costs storage and can never be
 * referenced, while a row without an object would be a broken photo in the gallery.
 */
async function uploadPreparedPhoto(
  userId: string,
  spotId: string,
  photo: LocalPhoto,
): Promise<Tables<'photos'>> {
  if (photo.width <= 0 || photo.height <= 0) {
    throw new Error('The photo has no dimensions.');
  }

  const bytes = await readBytes(photo.uri);
  const storagePath = objectKey(userId, spotId);

  const { error: uploadError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .upload(storagePath, bytes, {
      cacheControl: PHOTO_CACHE_CONTROL_S,
      contentType: PHOTO_CONTENT_TYPE,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data, error: insertError } = await supabase
    .from('photos')
    .insert({
      height: photo.height,
      size: bytes.byteLength,
      spot_id: spotId,
      storage_path: storagePath,
      user_id: userId,
      width: photo.width,
    })
    .select()
    .single();

  if (insertError) {
    await supabase.storage.from(PHOTO_BUCKET).remove([storagePath]);
    throw insertError;
  }

  return data;
}

/** Uploads one photo for a spot, as the athlete the session says. */
export async function uploadSpotPhoto(
  spotId: string,
  photo: LocalPhoto,
): Promise<Tables<'photos'>> {
  const userId = await getCurrentUserId();

  if (userId === null) {
    throw new Error('Sign in to upload photos.');
  }

  return uploadPreparedPhoto(userId, spotId, photo);
}

/**
 * Uploads a draft's photos in order, one at a time.
 *
 * Sequential rather than parallel so the gallery keeps the order the athlete picked, and so a bad
 * file fails alone instead of taking the batch down with it. The session is read once, before the
 * first byte, because every photo in the batch belongs to the same athlete.
 */
export async function uploadSpotPhotos(
  spotId: string,
  photos: readonly LocalPhoto[],
  options: PhotoUploadOptions = {},
): Promise<PhotoUploadResult> {
  const userId = await getCurrentUserId();

  if (userId === null) {
    throw new Error('Sign in to upload photos.');
  }

  const rows: Tables<'photos'>[] = [];
  const failed: PhotoUploadFailure[] = [];
  const total = photos.length;

  options.onProgress?.({ completed: 0, total });

  for (const photo of photos) {
    try {
      rows.push(await uploadPreparedPhoto(userId, spotId, photo));
    } catch (error: unknown) {
      failed.push({ message: messageOf(error), uri: photo.uri });
    }

    options.onProgress?.({ completed: rows.length + failed.length, total });
  }

  return { failed, rows };
}

/**
 * Deletes one stored photo: the object first, then the row that names it.
 *
 * That order makes a failure recoverable. If removing the row fails, the object is already gone
 * and retrying is a no-op removal plus the row delete; the other order would leave an object the
 * database has forgotten. Photos the caller does not own are invisible to the select, so this is
 * a no-op for them rather than a policy error.
 */
export async function deleteSpotPhoto(photoId: string): Promise<void> {
  const userId = await getCurrentUserId();

  if (userId === null) {
    throw new Error('Sign in to delete photos.');
  }

  const { data: photo, error: readError } = await supabase
    .from('photos')
    .select('id, storage_path, user_id')
    .eq('id', photoId)
    .maybeSingle();

  if (readError) throw readError;
  if (photo === null) return;

  if (photo.user_id !== userId) {
    throw new Error('You can only delete your own photos.');
  }

  const { error: removeError } = await supabase.storage
    .from(PHOTO_BUCKET)
    .remove([photo.storage_path]);

  if (removeError) throw removeError;

  const { error: deleteError } = await supabase.from('photos').delete().eq('id', photoId);

  if (deleteError) throw deleteError;
}

/**
 * Makes the stored photos match the draft: uploads the new files, then deletes the athlete's own
 * photos the draft no longer lists.
 *
 * Uploads run before deletions so a failed upload cannot combine with a removal to leave the spot
 * with fewer photos than either step intended. Photos by other contributors are never touched —
 * the editor only ever shows the athlete their own, and a save must not remove somebody else's
 * work.
 */
export async function syncSpotPhotos(
  spotId: string,
  photos: readonly DraftPhoto[],
  options: PhotoUploadOptions = {},
): Promise<PhotoUploadResult> {
  const userId = await getCurrentUserId();

  if (userId === null) {
    throw new Error('Sign in to update photos.');
  }

  const { data: existing, error } = await supabase
    .from('photos')
    .select('id')
    .eq('spot_id', spotId)
    .eq('user_id', userId);

  if (error) throw error;

  const keep = new Set(photos.filter(isStoredPhoto).map((photo) => photo.id));
  const added = photos.filter(isLocalPhoto);
  const removed = (existing ?? []).filter((row) => !keep.has(row.id));

  const result = await uploadSpotPhotos(spotId, added, options);

  for (const row of removed) {
    await deleteSpotPhoto(row.id);
  }

  return result;
}
