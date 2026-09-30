import type { ImageSourcePropType } from 'react-native';

/**
 * The bundled placeholder photo, shown wherever a spot needs a picture until Supabase Storage
 * provides real ones.
 *
 * One small stand-in rather than a set of demo photos: megabytes of sample images bought
 * nothing but app size, and every spot reads the same placeholder until real uploads replace
 * it.
 */
export const SPOT_PHOTO = require('@/assets/images/spot-placeholder.jpg') as ImageSourcePropType;
