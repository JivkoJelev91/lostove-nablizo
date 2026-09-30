import type { ImageSourcePropType } from 'react-native';

/**
 * The bundled demo photos, used wherever a spot needs a picture until Supabase Storage
 * provides real ones.
 *
 * A tuple rather than an array so indexing with a literal keeps its exact type under
 * `noUncheckedIndexedAccess`.
 */
export const SPOT_PHOTOS = [
  require('@/assets/images/lostove1.png') as number,
  require('@/assets/images/lostove2.png') as number,
  require('@/assets/images/lostove3.png') as number,
  require('@/assets/images/lostove4.png') as number,
] as const;

/**
 * The next demo photo a form can offer, skipping the ones already attached.
 *
 * The editors add photos from this list instead of opening a picker, so the previews and
 * the removal affordances can be exercised without a real image library.
 */
export function nextMockPhoto(used: readonly ImageSourcePropType[]): ImageSourcePropType {
  const unused = SPOT_PHOTOS.find((photo) => !used.includes(photo));

  return unused ?? SPOT_PHOTOS[0];
}
