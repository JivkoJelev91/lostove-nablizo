import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';

import type { Coordinate } from '@/features/spots/types';
import { queryKeys } from '@/lib/query-keys';

/** The parts of a geocoded address worth showing, most specific first, without repeats. */
function localityFrom(address: Location.LocationGeocodedAddress): string | undefined {
  const parts = [address.district, address.street ?? address.name, address.city].filter(
    (part): part is string => part !== null && part.trim().length > 0,
  );
  const unique = [...new Set(parts)];

  return unique.length === 0 ? undefined : unique.join(', ');
}

/**
 * The locality of a captured coordinate, from the platform's reverse geocoder.
 *
 * Real data or nothing: the review step used to name the position from a hardcoded list of Sofia
 * districts, which read like an address but was invented. The geocoder needs a connection on
 * Android; when it cannot answer, `undefined` is returned and the screen falls back to the
 * coordinates it actually has.
 */
export function useLocalityLabel(coordinate: Coordinate | null): string | undefined {
  const query = useQuery({
    queryKey: queryKeys.location.geocode(coordinate?.latitude ?? 0, coordinate?.longitude ?? 0),
    queryFn: async () => {
      if (coordinate === null) return undefined;

      const addresses = await Location.reverseGeocodeAsync(coordinate);
      const first = addresses[0];

      return first === undefined ? undefined : localityFrom(first);
    },
    enabled: coordinate !== null,
    // An address does not move; caching it for the session is the right amount of stale.
    staleTime: Infinity,
    retry: 1,
  });

  return query.data;
}
