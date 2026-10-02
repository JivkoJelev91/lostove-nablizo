import type { ImageSourcePropType } from 'react-native';

import type { EquipmentCondition, SpotEquipment, SpotStatus } from '@/components';

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
  /** The date a moderator last checked the spot, absent until one has. */
  verifiedAt?: Date;
  /** Straight-line distance from the mock user position, for the "Around you" ordering. */
  distanceKm: number;
  /** The spot's gallery, cover first. One bundled stand-in per frame until Storage provides real uploads. */
  images: readonly ImageSourcePropType[];
  /** Only `approved` spots reach the public screens; the rest wait in the owner's profile. */
  status: SpotStatus;
  /** The athlete who added the spot, absent on spots that arrived from an import. */
  ownerId?: string;
};

/** The fields a submitted spot carries; the store stamps its owner, status and aggregate. */
export type SpotSubmission = {
  name: string;
  description: string;
  coordinate: Coordinate;
  equipment: readonly SpotEquipment[];
  images: readonly ImageSourcePropType[];
};

/**
 * The fields an owner can change on a spot. The coordinate is not among them: moving a spot
 * is a different kind of claim, so it stays where the contributor captured it.
 *
 * A save puts the spot back under review, so an approved spot never keeps showing information
 * a moderator has not seen.
 */
export type SpotEdits = Omit<SpotSubmission, 'coordinate'> & {
  condition: EquipmentCondition;
};

/** One athlete's review of a spot, as the spot page lists it. */
export type SpotReview = {
  id: string;
  spotId: string;
  authorName: string;
  /**
   * The account that wrote the review, so the spot page can pick out the signed-in athlete's own
   * review by identity rather than by a display name two people can share.
   */
  authorId: string;
  rating: number;
  text: string;
  date: Date;
};
