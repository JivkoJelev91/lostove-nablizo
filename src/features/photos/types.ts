/** A prepared photo on the device, as the picker pipeline hands it over. */
export type LocalPhoto = {
  uri: string;
  width: number;
  height: number;
};

/** A photo that already has a `photos` row: the row id, who uploaded it, and its stored size. */
export type StoredPhoto = {
  id: string;
  userId: string;
  uri: string;
  width: number;
  height: number;
};

/**
 * A photo in an editor draft: one already stored, or one prepared on the device.
 *
 * The discriminant is what lets a save tell "keep this row" from "upload this file" without
 * guessing from the URI, and it is why an edit only deletes rows the draft no longer lists.
 */
export type DraftPhoto = (LocalPhoto & { kind: 'local' }) | (StoredPhoto & { kind: 'stored' });

/** True for a draft photo that exists only on the device. */
export function isLocalPhoto(photo: DraftPhoto): photo is LocalPhoto & { kind: 'local' } {
  return photo.kind === 'local';
}

/** True for a draft photo that already has a stored row. */
export function isStoredPhoto(photo: DraftPhoto): photo is StoredPhoto & { kind: 'stored' } {
  return photo.kind === 'stored';
}
