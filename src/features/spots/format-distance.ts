import { formatDecimal, t } from '@/i18n';

/**
 * How far a spot is from the athlete, as the cards show it: `1,2 км от теб`.
 *
 * Always one decimal, so a whole kilometre reads the same shape as any other distance instead
 * of collapsing to `2 км` in the middle of a list.
 */
export function formatDistanceAway(distanceKm: number): string {
  return t('distance.away', { distance: formatDecimal(distanceKm) });
}
