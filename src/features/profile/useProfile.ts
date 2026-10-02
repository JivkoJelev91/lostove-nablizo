import { useMemo } from 'react';

import { displayNameFromUser, usernameFromUser } from '@/features/auth/identity';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
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
 * There is no built-in athlete: the identity is the signed-in account's — the name given at
 * sign-up, then the handle from the profile row — and with nobody signed in every field is empty
 * rather than borrowed from a stand-in. The screens decide what an empty name looks like; this
 * hook only reports what is true.
 *
 * The contributions come from the shared stores, so a spot the athlete adds is the same object
 * the feed or the spot page would render and their reviews are the ones written under their name.
 * Until the stores read Supabase, that means the lists hold what this session has produced.
 */
export function useProfile() {
  const { profile, user } = useCurrentUser();
  const { ownReviews } = useReviews();
  const { ownedSpots } = useSpots();

  const spots = useMemo(
    () =>
      [...ownedSpots].sort(
        (first, second) =>
          STATUS_ORDER[first.status] - STATUS_ORDER[second.status] ||
          first.distanceMeters === null || second.distanceMeters === null
            ? 0
            : first.distanceMeters - second.distanceMeters,
      ),
    [ownedSpots],
  );

  const signedIn = user !== null;
  const displayName = signedIn ? (displayNameFromUser(user) ?? profile?.username ?? '') : '';
  const username = signedIn ? (profile?.username ?? usernameFromUser(user) ?? '') : '';

  return { displayName, reviews: ownReviews, signedIn, spots, username };
}
