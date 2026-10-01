import type { Coordinate } from '@/features/spots/types';

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * The great-circle distance between two points in kilometres.
 *
 * The haversine formula, so a submitted spot lands at a believable distance from the athlete
 * instead of a placeholder. The mock distances on the seeded spots are hand-written; a real
 * build computes them all this way once location is live.
 */
export function distanceKmBetween(first: Coordinate, second: Coordinate): number {
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.asin(Math.sqrt(haversine));
}
