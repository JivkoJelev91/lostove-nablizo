import type { ImageSourcePropType } from 'react-native';

import type { EquipmentCondition, SpotEquipment, SpotStatus } from '@/components';
import type { DraftPhoto, LocalPhoto, StoredPhoto } from '@/features/photos/types';

/**
 * A geographic point as plain numbers rather than a map library's type, which keeps it
 * usable outside the map feature.
 */
export type Coordinate = {
  latitude: number;
  longitude: number;
};

/**
 * How a spot's last verification was produced: the OSM import, a moderator review, or an
 * athlete standing at the spot. The badge colours the date; this says whose word it is.
 */
export type VerificationSource = 'import' | 'moderator' | 'user';

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
  /** The city or town the spot is in, when the source stated one; null otherwise. */
  city: string | null;
  rating: number;
  reviewCount: number;
  equipment: readonly SpotEquipment[];
  /** How well the whole set of equipment is holding up, shown on the spot page. */
  condition: EquipmentCondition;
  /** One or two sentences for the spot page, written like a listing description. */
  description: string;
  /** The date a moderator, the import or an athlete last checked the spot, absent if never. */
  verifiedAt?: Date;
  /** Whose check produced {@link verifiedAt}; absent together with it. */
  verificationSource?: VerificationSource;
  /**
   * How many distinct athletes have confirmed the spot, when the query asked for the count.
   * Absent on list cards, which fetch from the RPC functions that do not embed it.
   */
  verificationCount?: number;
  /** Straight-line distance from the athlete's position. `null` when no position is known. */
  distanceMeters: number | null;
  /** The spot's gallery, cover first. One bundled stand-in per frame until Storage provides real uploads. */
  images: readonly ImageSourcePropType[];
  /**
   * The gallery as stored records, which delete and edit need: each photo's row id and uploader.
   * `images` stays the render list; this is the one that can be pointed at a row.
   */
  photos: readonly StoredPhoto[];
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
  /** Prepared local files; the create flow uploads them once the spot has an id. */
  photos: readonly LocalPhoto[];
};

/**
 * The fields an owner can change on a spot. The coordinate is not among them: moving a spot
 * is a different kind of claim, so it stays where the contributor captured it.
 *
 * A save puts the spot back under review, so an approved spot never keeps showing information
 * a moderator has not seen.
 */
export type SpotEdits = {
  name: string;
  description: string;
  equipment: readonly SpotEquipment[];
  condition: EquipmentCondition;
  /** Stored rows to keep and local files to add; missing stored rows are deleted on save. */
  photos: readonly DraftPhoto[];
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
