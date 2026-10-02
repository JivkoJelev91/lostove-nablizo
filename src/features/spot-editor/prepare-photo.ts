import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import type { ImageResult } from 'expo-image-manipulator';

/** The longest edge a stored photo keeps. A spot photo is shown at card or detail size. */
export const MAX_PHOTO_EDGE = 1600;

/** JPEG quality for the stored copy: small enough to upload, still clean on a phone screen. */
export const PHOTO_JPEG_QUALITY = 0.75;

/** The part of a picked asset that preparing a photo needs. */
export type RawPhoto = {
  uri: string;
  width: number;
  height: number;
};

export type PreparedPhotos = {
  photos: ImageResult[];
  /** How many of the batch could not be prepared; the rest are still usable. */
  failed: number;
};

/**
 * Downscales and re-encodes one picked photo for upload.
 *
 * The long edge is capped at {@link MAX_PHOTO_EDGE} and the result is always JPEG at
 * {@link PHOTO_JPEG_QUALITY}, so a camera original never reaches storage — or the app's own
 * state — at full resolution. Resizing only one dimension lets the native side preserve the
 * aspect ratio, and an image already within the cap is left at its size. The original is
 * untouched: `saveAsync` writes a new file into the cache directory.
 */
export async function preparePhoto(photo: RawPhoto): Promise<ImageResult> {
  const context = ImageManipulator.manipulate(photo.uri);
  const longEdge = Math.max(photo.width, photo.height);

  if (photo.width > 0 && photo.height > 0 && longEdge > MAX_PHOTO_EDGE) {
    const scale = MAX_PHOTO_EDGE / longEdge;

    context.resize({
      height: Math.round(photo.height * scale),
      width: Math.round(photo.width * scale),
    });
  }

  const rendered = await context.renderAsync();

  return rendered.saveAsync({ compress: PHOTO_JPEG_QUALITY, format: SaveFormat.JPEG });
}

/**
 * Prepares a batch of picked photos, settling each one on its own.
 *
 * A single unreadable asset should not discard the rest of a gallery selection, so the batch is
 * fulfilled photo by photo and the caller is told how many failures to report.
 */
export async function preparePhotos(photos: readonly RawPhoto[]): Promise<PreparedPhotos> {
  const results = await Promise.allSettled(photos.map((photo) => preparePhoto(photo)));
  const prepared: ImageResult[] = [];
  let failed = 0;

  for (const result of results) {
    if (result.status === 'fulfilled') {
      prepared.push(result.value);
    } else {
      failed += 1;
    }
  }

  return { failed, photos: prepared };
}
