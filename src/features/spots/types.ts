import type { ImageSourcePropType } from 'react-native';

import type { EquipmentCondition, SpotEquipment } from '@/components';

/**
 * A spot as the discovery screens render it: the summary facts and the photo.
 *
 * The data layer will later map database rows into this shape, so the components never
 * learn where the data came from. Coordinates stay plain numbers rather than a map
 * library's type, which keeps this shape usable outside the map feature.
 */
export type Spot = {
  id: string;
  name: string;
  coordinate: { latitude: number; longitude: number };
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
  /** A bundled photo used until spots carry Supabase Storage paths. */
  image: ImageSourcePropType;
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
