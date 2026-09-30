import type { AddSpotStep, SpotDraft, SpotDraftErrors } from '@/features/spot-editor/types';

export const SPOT_NAME_MIN_LENGTH = 3;
export const SPOT_NAME_MAX_LENGTH = 60;
export const SPOT_DESCRIPTION_MIN_LENGTH = 20;
export const SPOT_DESCRIPTION_MAX_LENGTH = 300;

/** The message a name field shows, or undefined when the name is usable. */
export function validateName(name: string): string | undefined {
  const trimmed = name.trim();

  if (trimmed.length === 0) {
    return 'Enter a name for the spot.';
  }

  if (trimmed.length < SPOT_NAME_MIN_LENGTH) {
    return `Use at least ${SPOT_NAME_MIN_LENGTH} characters.`;
  }

  return undefined;
}

/** The message a description field shows, or undefined when the description is usable. */
export function validateDescription(description: string): string | undefined {
  const trimmed = description.trim();

  if (trimmed.length === 0) {
    return 'Describe the spot so others know what to expect.';
  }

  if (trimmed.length < SPOT_DESCRIPTION_MIN_LENGTH) {
    return `Use at least ${SPOT_DESCRIPTION_MIN_LENGTH} characters.`;
  }

  return undefined;
}

/** The message the equipment picker shows, or undefined when at least one piece is picked. */
export function validateEquipment(equipment: SpotDraft['equipment']): string | undefined {
  return equipment.length === 0 ? 'Select at least one piece of equipment.' : undefined;
}

/** The message the photo manager shows, or undefined when at least one photo is attached. */
export function validatePhotos(photos: SpotDraft['photos']): string | undefined {
  return photos.length === 0 ? 'Add at least one photo of the spot.' : undefined;
}

/** The message the location step shows, or undefined once a position was captured. */
export function validateLocation(coordinate: SpotDraft['coordinate']): string | undefined {
  return coordinate === null ? 'Capture the location before continuing.' : undefined;
}

/** Every field's state for a whole draft, used when the final action validates everything. */
export function validateDraft(draft: SpotDraft): SpotDraftErrors {
  return {
    location: validateLocation(draft.coordinate),
    name: validateName(draft.name),
    description: validateDescription(draft.description),
    equipment: validateEquipment(draft.equipment),
    photos: validatePhotos(draft.photos),
  };
}

/** Only the fields the given step owns, so Continue never reveals a later step's errors. */
export function validateStep(step: AddSpotStep, draft: SpotDraft): SpotDraftErrors {
  switch (step) {
    case 1:
      return { location: validateLocation(draft.coordinate) };
    case 2:
      return {
        name: validateName(draft.name),
        description: validateDescription(draft.description),
      };
    case 3:
      return { equipment: validateEquipment(draft.equipment) };
    case 4:
      return { photos: validatePhotos(draft.photos) };
    default:
      return {};
  }
}

/** True when any field carries a message. */
export function hasErrors(errors: SpotDraftErrors): boolean {
  return Object.values(errors).some((message) => message !== undefined);
}

/** The step a failed submit should jump back to: the first one carrying an error. */
export function firstInvalidStep(errors: SpotDraftErrors): AddSpotStep {
  if (errors.location !== undefined) {
    return 1;
  }

  if (errors.name !== undefined || errors.description !== undefined) {
    return 2;
  }

  if (errors.equipment !== undefined) {
    return 3;
  }

  return 4;
}
