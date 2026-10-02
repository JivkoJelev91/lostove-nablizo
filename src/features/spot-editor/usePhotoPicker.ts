import { useCallback, useRef, useState } from 'react';

import * as ImagePicker from 'expo-image-picker';
import type { ImageResult } from 'expo-image-manipulator';

import { preparePhotos } from '@/features/spot-editor/prepare-photo';

/** Which system surface the picker is about to open. */
export type PhotoSource = 'camera' | 'library';

/** What a pick attempt produced: prepared photos, a cancel, or a reason nothing was added. */
export type PhotoPickResult =
  | { status: 'picked'; photos: ImageResult[]; failed: number }
  | { status: 'canceled' }
  | { status: 'denied' }
  | { status: 'failed' };

export type PhotoPicker = {
  /** The surface waiting on the user, or null while the picker is idle. */
  busy: PhotoSource | null;
  takePhoto: () => Promise<PhotoPickResult>;
  pickFromLibrary: (selectionLimit: number) => Promise<PhotoPickResult>;
};

/** The picker's own compression, before preparation re-encodes at the stored quality. */
const PICKER_QUALITY = 0.8;

/** A finished system pick, turned into prepared photos or the reason there are none. */
async function fromPickerResult(result: ImagePicker.ImagePickerResult): Promise<PhotoPickResult> {
  if (result.canceled) {
    return { status: 'canceled' };
  }

  const prepared = await preparePhotos(result.assets);

  return { failed: prepared.failed, photos: prepared.photos, status: 'picked' };
}

/**
 * The camera and gallery surfaces behind the editor's add-photo actions.
 *
 * Every returned photo has already been through {@link preparePhotos}, so full-resolution
 * originals never enter the draft and cannot be uploaded by accident. The camera is the only
 * surface that needs a runtime permission: `launchCameraAsync` requires it, so the hook asks and
 * reports a denial instead of launching an unexplained system dialog. The library needs no
 * request — the system picker grants access to the chosen items by itself — so asking there
 * would prompt for broader access than the picker actually uses.
 */
export function usePhotoPicker(): PhotoPicker {
  const [busy, setBusy] = useState<PhotoSource | null>(null);
  const running = useRef(false);

  const run = useCallback(
    async (
      source: PhotoSource,
      launch: () => Promise<PhotoPickResult>,
    ): Promise<PhotoPickResult> => {
      if (running.current) {
        return { status: 'canceled' };
      }

      running.current = true;
      setBusy(source);

      try {
        return await launch();
      } catch {
        return { status: 'failed' };
      } finally {
        running.current = false;
        setBusy(null);
      }
    },
    [],
  );

  const takePhoto = useCallback(
    () =>
      run('camera', async () => {
        const permission = await ImagePicker.requestCameraPermissionsAsync();

        if (!permission.granted) {
          return { status: 'denied' };
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          quality: PICKER_QUALITY,
        });

        return fromPickerResult(result);
      }),
    [run],
  );

  const pickFromLibrary = useCallback(
    (selectionLimit: number) =>
      run('library', async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsMultipleSelection: selectionLimit > 1,
          selectionLimit,
          quality: PICKER_QUALITY,
        });

        return fromPickerResult(result);
      }),
    [run],
  );

  return { busy, pickFromLibrary, takePhoto };
}
