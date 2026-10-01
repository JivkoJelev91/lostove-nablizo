import type { Coordinate } from '@/features/spots/types';

/**
 * The districts the mock geocoder knows, matching the areas the mock spots sit in.
 *
 * A real build resolves an address through a geocoding service; until the data layer lands,
 * the review step names the pin's position by its nearest known district so the copy reads
 * like a place instead of a pair of numbers.
 */
const MOCK_DISTRICTS = [
  { name: 'Център', coordinate: { latitude: 42.6977, longitude: 23.3219 } },
  { name: 'Студентски град', coordinate: { latitude: 42.6504, longitude: 23.3509 } },
  { name: 'Борисова градина', coordinate: { latitude: 42.6873, longitude: 23.3415 } },
  { name: 'Южен парк', coordinate: { latitude: 42.6687, longitude: 23.3098 } },
  { name: 'Витоша', coordinate: { latitude: 42.6521, longitude: 23.2884 } },
  { name: 'Северен парк', coordinate: { latitude: 42.7296, longitude: 23.3233 } },
] as const;

/** The squared distance between two coordinates in degrees, enough to rank nearby districts. */
function squaredDistance(first: Coordinate, second: Coordinate): number {
  const latitudeDelta = first.latitude - second.latitude;
  const longitudeDelta = first.longitude - second.longitude;

  return latitudeDelta * latitudeDelta + longitudeDelta * longitudeDelta;
}

/** Names the pin's position, e.g. `Център, София`. */
export function describeLocality(coordinate: Coordinate): string {
  const nearest = MOCK_DISTRICTS.reduce((closest, district) =>
    squaredDistance(district.coordinate, coordinate) <
    squaredDistance(closest.coordinate, coordinate)
      ? district
      : closest,
  );

  return `${nearest.name}, София`;
}
