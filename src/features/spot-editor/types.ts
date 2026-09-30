import type { ImageSourcePropType } from 'react-native';

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
  name?: string;
  description?: string;
  equipment?: string;
  photos?: string;
};

/** A spot being created or edited, before anything reaches a backend. */
export type SpotDraft = {
  coordinate: Coordinate;
  name: string;
  description: string;
  equipment: readonly EquipmentDraftItem[];
  photos: readonly ImageSourcePropType[];
};

/**
 * Both platform implementations of the pin picker take this shape: the native one wraps a
 * map with a draggable marker, and the web one stands in for it.
 */
export type LocationPickerProps = {
  coordinate: Coordinate;
  onChange: (coordinate: Coordinate) => void;
};
