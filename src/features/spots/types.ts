import type { ImageSourcePropType } from 'react-native';

import type { EquipmentCondition, SpotEquipment } from '@/components';

/**
 * A geographic point as plain numbers rather than a map library's type, which keeps it
 * usable outside the map feature.
 */
export type Coordinate = {
  latitude: number;
  longitude: number;
};

/**
 * A spot as the discovery screens render it: the summary facts and the photo.
 *
 * The data layer will later map database rows into this shape, so the components never
 * learn where the data came from.
 */
export type Spot = {
  id: string;
  name: string;
  coordinate: Coordinate;
  rating: number;
  reviewCount: number;
  equipment: readonly SpotEquipment[];
  /** How well the whole set of equipment is holding up, shown on the spot page. */
  condition: EquipmentCondition;
  /** One or two sentences for the spot page, written like a listing description. */
  description: string;
  verifiedAt: Date;
  /** Straight-line distance from the mock user position, for the "Around you" ordering. */
  distanceKm: number;
  /** The spot's gallery, cover first. One bundled stand-in per frame until Storage provides real uploads. */
  images: readonly ImageSourcePropType[];
};

/** One athlete's review of a spot, as the spot page lists it. */
export type SpotReview = {
  id: string;
  spotId: string;
  authorName: string;
  rating: number;
  text: string;
  date: Date;
};
