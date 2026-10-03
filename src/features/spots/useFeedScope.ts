import { useCallback, useMemo, useState } from 'react';

import type { UserLocation } from '@/features/location/useUserLocation';

import type { FeedScope } from './useSpotsQuery';

export type FeedScopeController = {
  /** Whether the nearby list is one the athlete can ask for: it needs a position to measure from. */
  canBrowseNearby: boolean;
  /** Records the athlete's own choice, so a later position or resume cannot overrule it. */
  choose: (scope: FeedScope) => void;
  /** The catalogue the feed is showing, which is also what the heading names. */
  scope: FeedScope;
};

/**
 * Which catalogue the feed shows, and what the heading calls it.
 *
 * Without a position there is nothing to be near, so the feed is the whole directory and says so
 * rather than promising a proximity it cannot deliver — a heading reading "Около теб" above every
 * spot in the country is the kind of small lie that makes the app feel broken. A position turns the
 * nearby list on by itself: the athlete allowed location in order to see the spots around them, so
 * that is what they get. From then on their own choice is what counts, because a later fix, a
 * revoked permission or a resume must not move a list they have arranged themselves. Losing the
 * position is the one thing that overrides them: there is no nearby list without a fix, so the
 * heading goes back to naming the directory it is actually showing.
 *
 * @param location The shared location state, so the answer follows the permission that was asked for.
 * @returns The scope, whether it can be changed, and how to record a change.
 */
export function useFeedScope(location: UserLocation): FeedScopeController {
  const [chosen, setChosen] = useState<FeedScope | null>(null);
  const canBrowseNearby = location.coordinate !== null;
  const scope = useMemo(
    () => (canBrowseNearby ? (chosen ?? 'nearby') : 'all'),
    [canBrowseNearby, chosen],
  );
  const choose = useCallback((next: FeedScope) => setChosen(next), []);

  return { canBrowseNearby, choose, scope };
}
