import { getCurrentUserId } from '@/features/auth/current-user';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';

/**
 * A prepared photo on the device, as the picker pipeline hands it over: a local file, already
 * resized and re-encoded to JPEG.
 */
export type LocalPhoto = {
  uri: string;
  width: number;
  height: number;
};

/** One photo that failed to upload, with the reason to report. */
export type PhotoUploadFailure = {
  uri: string;
  message: string;
};

export type PhotoUploadResult = {
  rows: Tables<'photos'>[];
  failed: PhotoUploadFailure[];
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

/** The file's bytes, read off the device. */
async function readBytes(uri: string): Promise<ArrayBuffer> {
  const response = await fetch(uri);

  if (!response.ok) {
    throw new Error(`The photo could not be read from the device (HTTP ${response.status}).`);
  }

  return response.arrayBuffer();
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
): Promise<PhotoUploadResult> {
  const userId = await getCurrentUserId();

  if (userId === null) {
    throw new Error('Sign in to upload photos.');
  }

  const rows: Tables<'photos'>[] = [];
  const failed: PhotoUploadFailure[] = [];

  for (const photo of photos) {
    try {
      rows.push(await uploadPreparedPhoto(userId, spotId, photo));
    } catch (error: unknown) {
      failed.push({ message: messageOf(error), uri: photo.uri });
    }
  }

  return { failed, rows };
}
