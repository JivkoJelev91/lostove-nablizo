import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { UserLocation } from '@/features/location/useUserLocation';
import {
  createSpot,
  getNearbySpots,
  getOwnedSpots,
  getSpotById,
  getSpots,
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
 * The fetch waits for the permission question to be answered and, when it is granted, for the fix.
 * Fetching the full list first would download every spot on a launch that is about to ask for the
 * nearby ones instead: exactly the redundant download this whole path exists to avoid.
 */
export function useFeedSpotsQuery(location: UserLocation) {
  const { coordinate, failed, granted, resolved } = location;

  // A granted permission with no fix yet is a wait, not an answer. A *failed* fix is not a wait:
  // location services can be switched off, and the feed falling back to the full list is better
  // than a spinner that never resolves. The failure is already surfaced by the prompt.
  const waitingForFix = granted && !failed && coordinate === null;

  const query = useQuery({
    queryKey:
      coordinate === null
        ? spotsQueryKeys.lists()
        : spotsQueryKeys.nearby(coordinate.latitude, coordinate.longitude, NEARBY_RADIUS_M),
    queryFn: () => (coordinate === null ? getSpots() : getNearbySpots(coordinate, NEARBY_RADIUS_M)),
    enabled: resolved && !waitingForFix,
    // The two modes are separate cache entries, so granting location switches the key. Without a
    // placeholder that switch blanks the feed to its loading state; carrying the previous rows
    // over keeps the list the athlete was reading on screen until the nearby one arrives.
    placeholderData: (previous) => previous,
    staleTime: FEED_STALE_TIME_MS,
  });

  return {
    ...query,
    /** Whether the rows were measured from a position, which decides what an empty list means. */
    nearby: coordinate !== null,
    // A disabled query is `pending`, not `loading`, in v5, so the caller is told the difference
    // between "no spots" and "not allowed to ask yet".
    isLoading: query.isLoading || !resolved || waitingForFix,
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
