import type { Coordinate } from '@/features/spots/types';

/** A coordinate as decimal degrees, e.g. `42.65040, 23.35090`. */
export function formatCoordinates(coordinate: Coordinate): string {
  return `${coordinate.latitude.toFixed(5)}, ${coordinate.longitude.toFixed(5)}`;
}
