import { distanceMetersBetween } from '@/features/spots/distance';
import type { Coordinate, Spot } from '@/features/spots/types';

/**
 * Distances are measured here, on data already in memory, rather than asked for over the network.
 *
 * The feed needs every spot's coordinate anyway — it is the same rows the cards render — so the
 * arithmetic costs one haversine per spot and no request at all. A thousand spots is a few
 * thousand trig calls, which is nothing next to the render, and it happens once per coordinate
 * change rather than per spot, per list and per screen.
 *
 * The alternative — a database function that takes the athlete's position and returns each spot's
 * distance — was considered and rejected. It would not remove the fetch, because the feed still
 * needs the rows; it would only add a second one, and that second one would carry the athlete's
 * exact GPS coordinate to the server on every list load. A local directory is not worth turning
 * every browse into a location disclosure. The point where this changes is a radius query, where
 * "spots within 2 km" is a different question from "order these spots by distance" and the
 * database can answer it without shipping the whole table.
 */

/** A spot measured from a position, or the same spot unchanged when there is no position. */
export function withDistance(spot: Spot, origin: Coordinate | null): Spot {
  if (origin === null) {
    return spot;
  }

  return { ...spot, distanceMeters: distanceMetersBetween(origin, spot.coordinate) };
}

/**
 * Every spot measured from one position.
 *
 * The origin is passed once and the list comes back measured, rather than each caller asking a
 * helper per spot: that is what keeps this to one pass, and it is why the whole list is rebuilt
 * only when the rows or the position actually change.
 */
export function withDistances(spots: readonly Spot[], origin: Coordinate | null): Spot[] {
  if (origin === null) {
    return [...spots];
  }

  return spots.map((spot) => withDistance(spot, origin));
}

/**
 * Nearest first, with the spots that could not be measured last.
 *
 * A spot with no distance cannot claim to be nearer than one that has a distance, so it sorts
 * after every measured spot rather than being treated as zero and jumping to the top of a list
 * nobody asked to see broken. The fallback then preserves the order the query returned — newest
 * first — so an athlete with no location still gets a sensible feed.
 */
export function byDistance(first: Spot, second: Spot): number {
  if (first.distanceMeters === null) {
    return second.distanceMeters === null ? 0 : 1;
  }

  if (second.distanceMeters === null) {
    return -1;
  }

  return first.distanceMeters - second.distanceMeters;
}
