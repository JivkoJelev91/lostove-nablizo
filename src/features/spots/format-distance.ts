/**
 * How far a spot is from the athlete, as the cards show it: `1.2 km away`.
 *
 * Always one decimal, so a whole kilometre reads the same shape as any other distance instead
 * of collapsing to `2 km away` in the middle of a list.
 */
export function formatDistanceAway(distanceKm: number): string {
  return `${distanceKm.toFixed(1)} km away`;
}
