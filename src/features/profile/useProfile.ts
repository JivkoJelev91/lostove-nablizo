import { useMemo } from 'react';

import { MOCK_PROFILE } from '@/features/profile/mock-profile';
import { MOCK_REVIEWS } from '@/features/spots/mock-reviews';
import { MOCK_SPOTS } from '@/features/spots/mock-spots';

/**
 * The athlete behind the profile, with the spots they added and the reviews they wrote.
 *
 * The profile is a list of contributions, so the lists are resolved from the shared mock data
 * rather than written twice here: a spot the athlete added is the same object the discovery
 * feed shows, and their review is the same review the spot page shows. Counts on the screen are
 * taken from these lists, which keeps a stat from contradicting the list under it.
 */
export function useProfile() {
  const { displayName, reviewIds, spotIds, username } = MOCK_PROFILE;

  const spots = useMemo(
    () =>
      MOCK_SPOTS.filter((spot) => spotIds.includes(spot.id)).sort(
        (first, second) => first.distanceKm - second.distanceKm,
      ),
    [spotIds],
  );

  const reviews = useMemo(
    () =>
      MOCK_REVIEWS.filter((review) => reviewIds.includes(review.id)).sort(
        (first, second) => second.date.getTime() - first.date.getTime(),
      ),
    [reviewIds],
  );

  return { displayName, reviews, spots, username };
}
