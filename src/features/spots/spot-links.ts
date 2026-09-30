import type { Spot } from '@/features/spots/types';

/**
 * A universal Google Maps link for a spot.
 *
 * The link form opens the installed maps app on a phone and the browser on the web, so one
 * URL serves every platform the app runs on.
 */
export function spotDirectionsUrl(spot: Pick<Spot, 'coordinate'>): string {
  const { latitude, longitude } = spot.coordinate;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
