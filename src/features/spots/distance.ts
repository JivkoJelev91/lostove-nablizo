import type { Coordinate } from '@/features/spots/types';

/**
 * The mean Earth radius in metres (IUGG), not the 6371 km figure that circulates as "the" radius.
 *
 * The difference is about 0.1%, which is 30 m across Bulgaria and so invisible in any display
 * this app makes. It is spelled out here rather than folded into the formula because the number
 * looks wrong otherwise: 6 371 008.8 is not a typo, and a reader who "corrects" it to 6 371 000
 * silently changes every answer in the app.
 */
const EARTH_RADIUS_M = 6_371_008.8;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

/**
 * The great-circle distance between two points, in metres.
 *
 * Haversine, because the alternative people reach for first — treating a degree of longitude as
 * the same length as a degree of latitude — is wrong by up to 40% at Sofia's latitude and is
 * wrongest exactly where this app is used. Haversine costs a handful of trigonometry calls and is
 * accurate to a few metres over the tens of kilometres a city directory spans, which is well
 * inside the error of the phone's own position fix.
 *
 * Metres rather than kilometres because the display switches units at one kilometre: a distance
 * held in kilometres has to be multiplied back up to decide whether it is under the threshold, and
 * the round trip is where a `950 м` becomes `1,0 км`.
 */
export function distanceMetersBetween(first: Coordinate, second: Coordinate): number {
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);

  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) * Math.cos(secondLatitude) * Math.sin(longitudeDelta / 2) ** 2;

  return 2 * EARTH_RADIUS_M * Math.asin(Math.sqrt(haversine));
}

/** The same distance in kilometres, for the thresholds and sorting that are easier to read in them. */
export function distanceKmBetween(first: Coordinate, second: Coordinate): number {
  return distanceMetersBetween(first, second) / 1000;
}
