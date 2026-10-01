import type { ImageSourcePropType } from 'react-native';

/**
 * The bundled stand-in photos, shown wherever a spot needs pictures until Supabase Storage
 * provides real ones.
 *
 * `SPOT_PHOTO` is the empty-state frame. The three line-art frames are the same brand
 * illustration rather than stock park photos: enough for a multi-photo spot to exercise the
 * gallery, without pretending to be real photography or adding megabytes of sample images.
 */
export const SPOT_PHOTO = require('@/assets/images/spot-placeholder.jpg') as ImageSourcePropType;

export const SPOT_PHOTO_PULL_UP =
  require('@/assets/images/spot-photo-pull-up.png') as ImageSourcePropType;

export const SPOT_PHOTO_RINGS =
  require('@/assets/images/spot-photo-rings.png') as ImageSourcePropType;

export const SPOT_PHOTO_MONKEY_BARS =
  require('@/assets/images/spot-photo-monkey-bars.png') as ImageSourcePropType;

/** The photo that stands in for a whole gallery where a surface can show only one. */
export function coverImage(spot: { images: readonly ImageSourcePropType[] }): ImageSourcePropType {
  return spot.images[0] ?? SPOT_PHOTO;
}
