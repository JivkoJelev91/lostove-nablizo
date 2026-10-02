import { useCallback, useMemo, useState } from 'react';

import type { EquipmentCondition } from '@/components';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import type { DraftPhoto } from '@/features/photos/types';
import { isSpotPhotoUploadError } from '@/features/spots/spots-api';
import type { Spot } from '@/features/spots/types';
import { useUpdateSpotMutation } from '@/features/spots/useSpotsQuery';
import {
  equipmentDraftFromSpot,
  equipmentDraftsEqual,
} from '@/features/spot-editor/equipment-draft';
import type { EquipmentDraftItem, SpotDraftErrors } from '@/features/spot-editor/types';
import {
  hasErrors,
  validateDescription,
  validateEquipment,
  validateName,
  validatePhotos,
} from '@/features/spot-editor/validation';
import { useUnsavedChangesGuard } from '@/hooks/useUnsavedChangesGuard';
import type { TranslationKey } from '@/i18n';

/** True when two draft photos are the same file still in the same place in the list. */
function samePhoto(first: DraftPhoto, second: DraftPhoto): boolean {
  if (first.kind !== second.kind) {
    return false;
  }

  return first.kind === 'stored' && second.kind === 'stored'
    ? first.id === second.id
    : first.uri === second.uri;
}

/**
 * The athlete's own stored photos as draft entries. A spot can collect photos from several
 * contributors, so the editor only ever offers the ones this account may delete.
 *
 * A moderator fixing somebody else's listing is the exception: they manage the whole gallery, so
 * every stored photo is part of the draft. Their removals still only delete what they uploaded —
 * `syncSpotPhotos` scopes to the caller — and a removed photo by another contributor comes back
 * on the refetch, which is the honest outcome of a delete the database refuses.
 */
function ownedDraftPhotos(
  spot: Spot,
  userId: string | undefined,
  includeEveryPhoto: boolean,
): readonly DraftPhoto[] {
  return spot.photos
    .filter((photo) => includeEveryPhoto || photo.userId === (userId ?? ''))
    .map((photo) => ({
      height: photo.height,
      id: photo.id,
      kind: 'stored' as const,
      uri: photo.uri,
      userId: photo.userId,
      width: photo.width,
    }));
}

/** True when the draft lists exactly the same photos, in the same order, as it started with. */
function photosMatch(photos: readonly DraftPhoto[], initial: readonly DraftPhoto[]): boolean {
  return (
    photos.length === initial.length &&
    photos.every((photo, index) => {
      const starting = initial[index];

      return starting !== undefined && samePhoto(photo, starting);
    })
  );
}

/**
 * The Edit Spot form's state: every field's draft value, validation, dirtiness, and the save
 * lifecycle.
 *
 * The draft carries the athlete's own photos, or every photo when a moderator is fixing somebody
 * else's listing. A save must delete only the rows its own uploader is allowed to delete — so
 * another contributor's work is not shown as removable to an owner, and `updateSpot` repeats the
 * same restriction at the database.
 *
 * A dirty form asks before it discards, whichever way the screen is left: the header back
 * button and Cancel call {@link requestClose}, and Android's back button is intercepted by
 * {@link useUnsavedChangesGuard}. A save writes to Supabase — which sends the spot back to
 * review — and the confirmation appears after the request settles.
 */
export function useEditSpotDraft(spot: Spot, moderating = false) {
  const { user } = useCurrentUser();
  const { mutateAsync: updateSpot } = useUpdateSpotMutation();
  const initialEquipment = useMemo(() => equipmentDraftFromSpot(spot), [spot]);
  const initialPhotos = useMemo(
    () => ownedDraftPhotos(spot, user?.id, moderating),
    [moderating, spot, user?.id],
  );
  const [name, setName] = useState(spot.name);
  const [description, setDescription] = useState(spot.description);
  const [equipment, setEquipment] = useState<readonly EquipmentDraftItem[]>(initialEquipment);
  const [condition, setCondition] = useState<EquipmentCondition>(spot.condition);
  const [photos, setPhotos] = useState<readonly DraftPhoto[]>(initialPhotos);
  const [errors, setErrors] = useState<SpotDraftErrors>({});
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<TranslationKey | undefined>(undefined);
  const [savedVisible, setSavedVisible] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);

  const photosUnchanged = photosMatch(photos, initialPhotos);

  const isDirty =
    name !== spot.name ||
    description !== spot.description ||
    condition !== spot.condition ||
    !equipmentDraftsEqual(equipment, initialEquipment) ||
    !photosUnchanged;

  const showDiscard = useCallback(() => setDiscardVisible(true), []);
  const leave = useUnsavedChangesGuard(isDirty, showDiscard);

  const changeName = useCallback((value: string) => {
    setName(value);
    setErrors((current) => ({ ...current, name: undefined }));
  }, []);

  const changeDescription = useCallback((value: string) => {
    setDescription(value);
    setErrors((current) => ({ ...current, description: undefined }));
  }, []);

  const changeEquipment = useCallback((value: readonly EquipmentDraftItem[]) => {
    setEquipment(value);
    setErrors((current) => ({ ...current, equipment: undefined }));
  }, []);

  const changePhotos = useCallback((value: readonly DraftPhoto[]) => {
    setPhotos(value);
    setErrors((current) => ({ ...current, photos: undefined }));
  }, []);

  const requestClose = useCallback(() => {
    if (isDirty) {
      setDiscardVisible(true);
      return;
    }

    leave();
  }, [isDirty, leave]);

  const cancelDiscard = useCallback(() => setDiscardVisible(false), []);

  const confirmDiscard = useCallback(() => {
    setDiscardVisible(false);
    leave();
  }, [leave]);

  const handleSave = useCallback(async () => {
    const nextErrors: SpotDraftErrors = {
      name: validateName(name),
      description: validateDescription(description),
      equipment: validateEquipment(equipment),
      photos: validatePhotos(photos),
    };

    if (hasErrors(nextErrors)) {
      setErrors(nextErrors);
      return;
    }

    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    setErrors({});
    setSaveError(undefined);
    setSaving(true);

    try {
      // The store puts the spot back under review, so an approved spot stops showing facts a
      // moderator has not seen. Photos sync inside the same call: new files upload first, then
      // the rows the draft dropped are deleted.
      await updateSpot({
        edits: {
          condition,
          description: trimmedDescription,
          equipment,
          name: trimmedName,
          photos,
        },
        spotId: spot.id,
      });

      setName(trimmedName);
      setDescription(trimmedDescription);
      setSavedVisible(true);
    } catch (error: unknown) {
      // A save can land in two ways: nothing was written, or the fields were written and only
      // some photos failed. The second must not tell the athlete the whole edit was lost.
      setSaveError(isSpotPhotoUploadError(error) ? 'submit.photosFailed' : 'submit.saveFailed');
    } finally {
      setSaving(false);
    }
  }, [condition, description, equipment, name, photos, spot.id, updateSpot]);

  const handleSavedDone = useCallback(() => {
    setSavedVisible(false);
    leave();
  }, [leave]);

  return {
    cancelDiscard,
    changeCondition: setCondition,
    changeDescription,
    changeEquipment,
    changeName,
    changePhotos,
    condition,
    confirmDiscard,
    description,
    discardVisible,
    equipment,
    errors,
    handleSave,
    handleSavedDone,
    name,
    photos,
    requestClose,
    saveError,
    savedVisible,
    saving,
  };
}
