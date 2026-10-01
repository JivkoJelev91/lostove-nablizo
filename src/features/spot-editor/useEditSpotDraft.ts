import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';

import type { EquipmentCondition } from '@/components';
import type { Spot } from '@/features/spots/types';
import { useSpots } from '@/features/spots/useSpots';
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

/** How long the mock save spends "saving" before the confirmation appears. */
const SAVE_DELAY_MS = 1100;

/**
 * The Edit Spot form's state: every field's draft value, validation, dirtiness, and the mock
 * save lifecycle.
 *
 * A dirty form asks before it discards, whichever way the screen is left: the header back
 * button and Cancel call {@link requestClose}, and Android's back button is intercepted by
 * {@link useUnsavedChangesGuard}. A save writes to the spots store — which sends the spot back
 * to review — and then behaves like a pending request for a moment before the confirmation.
 */
export function useEditSpotDraft(spot: Spot) {
  const { updateSpot } = useSpots();
  const initialEquipment = useMemo(() => equipmentDraftFromSpot(spot), [spot]);
  const [name, setName] = useState(spot.name);
  const [description, setDescription] = useState(spot.description);
  const [equipment, setEquipment] = useState<readonly EquipmentDraftItem[]>(initialEquipment);
  const [condition, setCondition] = useState<EquipmentCondition>(spot.condition);
  const [photos, setPhotos] = useState<readonly ImageSourcePropType[]>(spot.images);
  const [errors, setErrors] = useState<SpotDraftErrors>({});
  const [saving, setSaving] = useState(false);
  const [savedVisible, setSavedVisible] = useState(false);
  const [discardVisible, setDiscardVisible] = useState(false);

  const photosUnchanged =
    photos.length === spot.images.length &&
    photos.every((photo, index) => photo === spot.images[index]);

  const isDirty =
    name !== spot.name ||
    description !== spot.description ||
    condition !== spot.condition ||
    !equipmentDraftsEqual(equipment, initialEquipment) ||
    !photosUnchanged;

  const showDiscard = useCallback(() => setDiscardVisible(true), []);
  const leave = useUnsavedChangesGuard(isDirty, showDiscard);

  useEffect(() => {
    if (!saving) {
      return;
    }

    const timeout = setTimeout(() => {
      setSaving(false);
      setSavedVisible(true);
    }, SAVE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [saving]);

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

  const changePhotos = useCallback((value: readonly ImageSourcePropType[]) => {
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

  const handleSave = useCallback(() => {
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

    // The store puts the spot back under review, so an approved spot stops showing facts a
    // moderator has not seen. Trimming here keeps the form's state equal to what was stored.
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();

    setName(trimmedName);
    setDescription(trimmedDescription);
    updateSpot(spot.id, {
      name: trimmedName,
      description: trimmedDescription,
      equipment,
      condition,
      images: photos,
    });
    setErrors({});
    setSaving(true);
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
    savedVisible,
    saving,
  };
}
