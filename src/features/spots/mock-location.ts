import type { Coordinate } from '@/features/spots/types';

/**
 * Where the mock athlete stands, which the discovery feed's distances are measured from.
 *
 * The geocoder's district list carries the same point as Sofia Center, so a pin dropped at the
 * centre is described and ranked the same way everywhere.
 */
export const MOCK_USER_COORDINATE: Coordinate = { latitude: 42.6977, longitude: 23.3219 };
