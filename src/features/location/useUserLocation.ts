import { useCallback } from 'react';
import { Linking } from 'react-native';

import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';

import type { Coordinate } from '@/features/spots/types';
import { queryKeys } from '@/lib/query-keys';

/** How stale a stored fix may be before asking the device for a new one, in milliseconds. */
const ACCEPTED_FIX_AGE_MS = 5 * 60 * 1000;

/** The worst accuracy still good enough for "which park is closer", in metres. */
const ACCEPTED_FIX_ACCURACY_M = 1000;

export type UserLocation = {
  /** The device's position, or `null` when permission is not granted or no fix has arrived. */
  coordinate: Coordinate | null;
  /** Whether the athlete has allowed location access. */
  granted: boolean;
  /** False until the OS has answered whether permission is granted. */
  resolved: boolean;
  /** True when the fix could not be read, such as when location services are switched off. */
  failed: boolean;
  /** Asks for permission, or opens the system settings when the OS will not ask again. */
  request: () => void;
};

/**
 * Reads a position from the device, without ever asking for one the athlete did not offer.
 *
 * Three decisions are worth more than the code that makes them.
 *
 * It does not request permission on mount. A cold start that immediately raises the system dialog
 * is the pattern every platform's guidance tells you to avoid: the athlete has not seen the feed
 * yet and cannot know what the permission is for. `request` is exposed so a screen can ask in
 * context, next to the words that explain it.
 *
 * It reads a recent stored fix before asking for a new one. `getCurrentPositionAsync` powers up
 * the receiver and can take seconds indoors; `getLastKnownPositionAsync` is a lookup that normally
 * answers instantly. A five-minute-old position is accurate to the street, which is the resolution
 * "which spot is nearer" needs — and the fresh fix is only requested when that lookup comes back
 * empty.
 *
 * It does not refetch on every mount. The position is held under one key with a five-minute
 * lifetime, so the feed, the search sheet and any later screen share one fix rather than each
 * waking the receiver.
 *
 * The retry is off on purpose: a device with location services switched off fails the same way
 * every time, and retrying only postpones the honest answer that there is no position.
 */
export function useUserLocation(): UserLocation {
  const [permission, requestPermission] = Location.useForegroundPermissions();

  const granted = permission?.granted === true;
  const resolved = permission !== null;

  const query = useQuery({
    queryKey: queryKeys.location.current(),
    queryFn: async (): Promise<Coordinate> => {
      const stored = await Location.getLastKnownPositionAsync({
        maxAge: ACCEPTED_FIX_AGE_MS,
        requiredAccuracy: ACCEPTED_FIX_ACCURACY_M,
      });

      const position =
        stored ??
        (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    },
    enabled: granted,
    staleTime: ACCEPTED_FIX_AGE_MS,
    retry: false,
  });

  const request = useCallback(() => {
    // Once the OS has stopped offering the dialog, asking again does nothing. The only way left is
    // the settings app, and sending the athlete there is more useful than a button that appears to
    // do nothing when pressed.
    if (permission !== null && !permission.granted && !permission.canAskAgain) {
      void Linking.openSettings();
      return;
    }

    void requestPermission();
  }, [permission, requestPermission]);

  return {
    coordinate: query.data ?? null,
    granted,
    resolved,
    failed: granted && query.isError,
    request,
  };
}
