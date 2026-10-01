import { useMemo } from 'react';

import { MOCK_PROFILE } from '@/features/profile/mock-profile';
import { useReviews } from '@/features/reviews/useReviews';
import { MOCK_SPOTS } from '@/features/spots/mock-spots';

/**
 * The athlete behind the profile, with the spots they added and the reviews they wrote.
 *
 * The profile is a list of contributions, so the lists are resolved from the shared data rather
 * than written twice here: a spot the athlete added is the same object the discovery feed shows,
 * and their reviews come from the reviews store, so an edit on a spot page shows up here too.
 * Counts on the screen are taken from these lists, which keeps a stat from contradicting the
 * list under it.
 */
export function useProfile() {
  const { displayName, spotIds, username } = MOCK_PROFILE;
  const { ownReviews } = useReviews();

  const spots = useMemo(
    () =>
      MOCK_SPOTS.filter((spot) => spotIds.includes(spot.id)).sort(
        (first, second) => first.distanceKm - second.distanceKm,
      ),
    [spotIds],
  );

  return { displayName, reviews: ownReviews, spots, username };
}
