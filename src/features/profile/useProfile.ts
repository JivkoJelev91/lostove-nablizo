import { useMemo } from 'react';

import { MOCK_PROFILE } from '@/features/profile/mock-profile';
import { useReviews } from '@/features/reviews/useReviews';
import { useSpots } from '@/features/spots/useSpots';
import type { SpotStatus } from '@/components';

/**
 * What the athlete's profile lists first: a submission a moderator has not cleared yet needs
 * attention, so it leads the section; approved spots follow, nearest first within each group.
 */
const STATUS_ORDER: Record<SpotStatus, number> = {
  under_review: 0,
  rejected: 1,
  closed: 2,
  approved: 3,
};

/**
 * The athlete behind the profile, with the spots they added and the reviews they wrote.
 *
 * The profile is a list of contributions, so the lists are resolved from the shared stores
 * rather than written twice here: a spot the athlete added is the same object the feed or the
 * spot page would render, whatever its review state, and their reviews come from the reviews
 * store, so a write on a spot page shows up here too. Counts on the screen are taken from
 * these lists, which keeps a stat from contradicting the list under it.
 */
export function useProfile() {
  const { displayName, username } = MOCK_PROFILE;
  const { ownReviews } = useReviews();
  const { ownedSpots } = useSpots();

  const spots = useMemo(
    () =>
      [...ownedSpots].sort(
        (first, second) =>
          STATUS_ORDER[first.status] - STATUS_ORDER[second.status] ||
          first.distanceKm - second.distanceKm,
      ),
    [ownedSpots],
  );

  return { displayName, reviews: ownReviews, spots, username };
}
