import { formatDecimal, t } from '@/i18n';

/**
 * Where a distance stops being useful in metres.
 *
 * "1 000 м от теб" is three times the width of the sentence around it, and past a kilometre the
 * athlete is not choosing between walking and not walking. A kilometre is also the point at which
 * one decimal stops carrying information: below it, `850 м` is a real distinction between two
 * parks; above it, `1,0 км` and `1,1 км` are the same walk.
 */
const METERS_CUTOFF = 1000;

/**
 * Below this, the spot is where the athlete is standing and the metres are noise.
 *
 * A phone's own fix is good to about 5–20 m, so anything under 30 m is inside the error of the
 * measurement rather than a fact about the spot. Saying "0 м" would also read as a broken
 * calculation, which is the exact wrong impression to leave on a card.
 */
const HERE_CUTOFF_M = 30;

/**
 * Round to the nearest 10 m under a kilometre.
 *
 * Ten metres is roughly what the hardware can resolve, so this is the finest distinction the
 * number is entitled to make. Rounding to whole metres prints precision the app does not have.
 */
const roundMeters = (meters: number): number => Math.round(meters / 10) * 10;

/** How far a spot is from the athlete, in the unit that reads best at that distance. */
export function formatDistance(distanceMeters: number): string {
  if (distanceMeters < HERE_CUTOFF_M) {
    return t('distance.here');
  }

  if (distanceMeters < METERS_CUTOFF) {
    return t('distance.meters', { distance: formatDecimal(roundMeters(distanceMeters), 0) });
  }

  return t('distance.kilometers', { distance: formatDecimal(distanceMeters / 1000, 1) });
}

/**
 * How far a spot is from the athlete, as the cards show it: `350 м от теб` or `1,2 км от теб`.
 *
 * `null` is a real answer, not a missing one: it means the app has no position to measure from,
 * because the athlete has not granted location access or the fix failed. A guest still gets the
 * whole feed, so the label has to be honest about not knowing rather than print `0 м`, which would
 * claim every spot is where they are standing.
 */
export function formatDistanceAway(distanceMeters: number | null): string {
  return distanceMeters === null ? t('distance.unknown') : formatDistance(distanceMeters);
}
