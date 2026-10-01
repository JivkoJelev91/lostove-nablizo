import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ImageSourcePropType } from 'react-native';

import type { EquipmentCondition } from '@/components';
import type { Spot } from '@/features/spots/types';
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
 * {@link useUnsavedChangesGuard}. Saving is simulated until the data layer exists.
 */
export function useEditSpotDraft(spot: Spot) {
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

    setErrors({});
    setSaving(true);
  }, [description, equipment, name, photos]);

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
