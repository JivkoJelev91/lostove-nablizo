import { useCallback, useRef, useState } from 'react';

import * as ImagePicker from 'expo-image-picker';
import type { ImagePickerAsset } from 'expo-image-picker';

/** Which system surface the picker is about to open. */
export type PhotoSource = 'camera' | 'library';

/** What a pick attempt produced: assets to add, a cancel, or a reason nothing was added. */
export type PhotoPickResult =
  | { status: 'picked'; assets: ImagePickerAsset[] }
  | { status: 'canceled' }
  | { status: 'denied' }
  | { status: 'failed' };

export type PhotoPicker = {
  /** The surface waiting on the user, or null while the picker is idle. */
  busy: PhotoSource | null;
  takePhoto: () => Promise<PhotoPickResult>;
  pickFromLibrary: (selectionLimit: number) => Promise<PhotoPickResult>;
};

/** A spot photo is displayed at card size; full camera resolution would only cost upload time. */
const PHOTO_QUALITY = 0.8;

/**
 * The camera and gallery surfaces behind the editor's add-photo actions.
 *
 * The camera is the only one that needs a runtime permission: `launchCameraAsync` requires it,
 * so the hook asks and reports a denial instead of launching an unexplained system dialog. The
 * library needs no request — the system picker grants access to the chosen items by itself — so
 * asking there would prompt for broader access than the picker actually uses.
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
          quality: PHOTO_QUALITY,
        });

        return result.canceled
          ? { status: 'canceled' }
          : { status: 'picked', assets: result.assets };
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
          quality: PHOTO_QUALITY,
        });

        return result.canceled
          ? { status: 'canceled' }
          : { status: 'picked', assets: result.assets };
      }),
    [run],
  );

  return { busy, pickFromLibrary, takePhoto };
}
