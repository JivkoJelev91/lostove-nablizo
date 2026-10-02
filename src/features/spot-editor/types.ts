import type { DraftPhoto } from '@/features/photos/types';
import type { Coordinate } from '@/features/spots/types';
import type { EquipmentName } from '@/features/spots/equipment-icons';

/** One equipment pick in a draft, with the quantity the stepper has reached. */
export type EquipmentDraftItem = {
  name: EquipmentName;
  quantity: number;
};

/** The Add Spot wizard's steps, in order. */
export type AddSpotStep = 1 | 2 | 3 | 4 | 5;

/** The fields an editor validates, each holding the message to show under its control. */
export type SpotDraftErrors = {
  location?: string;
  name?: string;
  description?: string;
  equipment?: string;
  photos?: string;
};

/** A spot being created or edited, before anything reaches a backend. */
export type SpotDraft = {
  /** Null until the device reports a position; the wizard refuses to continue without one. */
  coordinate: Coordinate | null;
  name: string;
  description: string;
  equipment: readonly EquipmentDraftItem[];
  photos: readonly DraftPhoto[];
};
