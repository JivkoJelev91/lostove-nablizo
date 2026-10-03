import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UserLocation } from '@/features/location/useUserLocation';
import {
  createSpot,
  FEED_PAGE_SIZE,
  getNearbySpots,
  getOwnedSpots,
  getSpotById,
  getSpotsPage,
  reportSpot,
  searchSpots,
  SEARCH_MIN_QUERY_LENGTH,
  updateSpot,
  verifySpot,
} from '@/features/spots/spots-api';
import type { ReportSpotInput } from '@/features/spots/spots-api';
import type { SpotEdits, SpotSubmission } from '@/features/spots/types';
import { queryKeys } from '@/lib/query-keys';

export const spotsQueryKeys = queryKeys.spots;

/**
 * How far from the athlete the feed still counts as "around you", in metres.
 *
 * Twenty-five kilometres covers a city and its suburbs without reaching the next one, which is the
 * distance at which "nearby" stops being a distinction worth making. It is deliberately generous
 * inside that: a spot at the edge of the city is still a place they could go today, and an empty
 * feed is a worse failure than an extra row.
 */
export const NEARBY_RADIUS_M = 25_000;

/** How long a feed answer is served without asking the database again. */
const FEED_STALE_TIME_MS = 60_000;

/**
 * Which catalogue the feed is showing: the spots around the athlete, or every approved spot.
 *
 * `nearby` follows the position — before permission is answered it waits, and it falls back to the
 * directory on its own when there is no fix. `all` is the directory by choice, which is why the
 * scope decides the query rather than the permission: an athlete with a perfectly good position
 * may still ask for the whole country.
 */
export type FeedScope = 'nearby' | 'all';

/**
 * The discovery list: the spots around the athlete, or every approved spot without a position.
 *
 * The mode is decided by whether a coordinate exists, and the two modes are separate cache
 * entries. That separation is load-bearing: sharing one entry would let an athlete who grants
 * location be served the country-wide list from cache and never see the nearby one, and it would
 * let a distance measured in Sofia be shown after they land in Varna.
 *
 * The fallback is not a failure path. A guest or an athlete who declines location still gets the
 * directory — the prompt says browsing is public — and the cards say the distance is unknown
 * rather than printing a number the app cannot know.
 *
 * Both modes are paged, one {@link FEED_PAGE_SIZE} at a time: the database orders by distance or
 * recency and the feed asks for the next page as the athlete nears the end of the list, so a
 * directory that grows to thousands never arrives in one response. The fetch also waits for the
 * permission question to be answered and, when it is granted, for the fix — unless the scope is
 * `all`, where the position is irrelevant to the answer.
 */
export function useFeedSpotsQuery(location: UserLocation, scope: FeedScope = 'nearby') {
  const { coordinate, failed, granted, resolved } = location;
  const wantsNearby = scope === 'nearby';

  // The directory mode deliberately runs without a coordinate even when one exists: the athlete
  // asked for every spot, and the coordinate is what "nearby" would have meant.
  const scopedCoordinate = wantsNearby ? coordinate : null;

  // A granted permission with no fix yet is a wait, not an answer. A *failed* fix is not a wait:
  // location services can be switched off, and the feed falling back to the full list is better
  // than a spinner that never resolves. The failure is already surfaced by the prompt.
  const waitingForFix = wantsNearby && granted && !failed && coordinate === null;

  const query = useInfiniteQuery({
    queryKey:
      scopedCoordinate === null
        ? spotsQueryKeys.lists()
        : spotsQueryKeys.nearby(
            scopedCoordinate.latitude,
            scopedCoordinate.longitude,
            NEARBY_RADIUS_M,
          ),
    queryFn: ({ pageParam }) =>
      scopedCoordinate === null
        ? getSpotsPage(pageParam)
        : getNearbySpots(scopedCoordinate, NEARBY_RADIUS_M, pageParam),
    initialPageParam: 0,
    // A full page means there may be more; a short page is the end. No total count is requested:
    // the feed only needs to know whether to keep a loader at the bottom.
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length === FEED_PAGE_SIZE ? allPages.length * FEED_PAGE_SIZE : undefined,
    enabled: (resolved || !wantsNearby) && !waitingForFix,
    // The two modes are separate cache entries, so granting location switches the key. Without a
    // placeholder that switch blanks the feed to its loading state; carrying the previous rows
    // over keeps the list the athlete was reading on screen until the nearby one arrives.
    placeholderData: (previous) => previous,
    staleTime: FEED_STALE_TIME_MS,
  });

  return {
    ...query,
    /** Whether the rows were measured from a position, which decides what an empty list means. */
    nearby: scopedCoordinate !== null,
    /** The pages as the one list the screens render; nothing outside this hook knows about pages. */
    spots: query.data?.pages.flat() ?? [],
    // A disabled query is `pending`, not `loading`, in v5, so the caller is told the difference
    // between "no spots" and "not allowed to ask yet".
    isLoading: query.isLoading || (wantsNearby && (!resolved || waitingForFix)),
  };
}

/**
 * One spot for the detail page, or `null` when there is no such spot.
 *
 * `null` is a settled answer, not a failure: a wrong id, a deleted spot and a spot RLS hides all
 * arrive here, and the screen shows the same not-found state for each rather than an error the
 * athlete can do nothing about.
 */
export function useSpotQuery(spotId: string | null) {
  return useQuery({
    queryKey: spotsQueryKeys.detail(spotId ?? ''),
    queryFn: () => getSpotById(spotId ?? ''),
    enabled: spotId !== null,
  });
}

/**
 * The spots the signed-in athlete added, whatever their moderation state.
 *
 * Disabled for a guest: there is no owner to ask about, and an empty list is the honest answer
 * rather than a request that can only come back empty.
 */
export function useOwnedSpotsQuery(userId: string | null) {
  return useQuery({
    queryKey: spotsQueryKeys.owned(userId ?? ''),
    queryFn: () => getOwnedSpots(userId ?? ''),
    enabled: userId !== null,
  });
}

/** How long a search answer is served without asking the database again. */
const SEARCH_STALE_TIME_MS = 30_000;

/**
 * One database search over the directory, or a disabled query while the term is too short.
 *
 * Disabled rather than sent-and-ignored: the function itself answers a one-character term with
 * nothing, so a request for it is a round trip that can only return an empty list. The previous
 * term's results stay on screen while the next one loads, so the list does not flash empty
 * between keystrokes.
 */
export function useSearchSpotsQuery(query: string) {
  const trimmed = query.trim();

  return useQuery({
    queryKey: spotsQueryKeys.search(trimmed),
    queryFn: () => searchSpots(trimmed),
    enabled: trimmed.length >= SEARCH_MIN_QUERY_LENGTH,
    placeholderData: (previous) => previous,
    staleTime: SEARCH_STALE_TIME_MS,
  });
}

/** Files a submission and refreshes the feed so the new spot appears under the athlete's profile. */
export function useCreateSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submission: SpotSubmission) => createSpot(submission),
    // No retry: a create whose response was lost may already have inserted, and the insert has no
    // idempotency key, so a retry on a flaky connection is how one submission becomes two spots.
    retry: 0,
    onSuccess: async () => {
      // Every spots query, not just the plain list: the feed may be the nearby query, whose key
      // carries the athlete's position. Invalidating `lists()` alone would leave a newly added
      // spot out of the list the athlete is actually looking at.
      await queryClient.invalidateQueries({ queryKey: spotsQueryKeys.all });
    },
  });
}

/**
 * Saves an owner's edits and refreshes the spot and the feed.
 *
 * Refetched rather than patched from the mutation's return value: the save resets the status to
 * under review, and only a refetched row is guaranteed to agree with what the database now holds.
 */
export function useUpdateSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spotId, edits }: { spotId: string; edits: SpotEdits }) =>
      updateSpot(spotId, edits),
    // Same reason as create: the write is not keyed, and a retry after a lost response could
    // upload the same new photos twice.
    retry: 0,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: spotsQueryKeys.all });
    },
  });
}

/** Files a report. Nothing on screen changes, so no cache is touched. */
export function useReportSpotMutation() {
  return useMutation({
    mutationFn: (input: ReportSpotInput) => reportSpot(input),
  });
}

/**
 * Confirms a spot and refreshes everything that shows its verification.
 *
 * Every spots query, not just this spot: the date travelled onto the cards as well, and a feed
 * that keeps serving yesterday's red badge after the athlete just turned it green is the same bug
 * the mutation exists to prevent.
 */
export function useVerifySpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (spotId: string) => verifySpot(spotId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: spotsQueryKeys.all });
    },
  });
}
