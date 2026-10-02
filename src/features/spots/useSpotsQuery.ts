import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createSpot,
  getSpotById,
  getSpots,
  reportSpot,
  updateSpot,
} from '@/features/spots/spots-api';
import type { ReportSpotInput } from '@/features/spots/spots-api';
import type { SpotEdits, SpotSubmission } from '@/features/spots/types';
import { queryKeys } from '@/lib/query-keys';

export const spotsQueryKeys = queryKeys.spots;

/**
 * The discovery list: every spot with its equipment and photos.
 *
 * Not filtered by status here — the caller decides, because the profile legitimately shows a
 * submission that is still under review while the home feed must not.
 */
export function useSpotsQuery() {
  return useQuery({
    queryKey: spotsQueryKeys.lists(),
    queryFn: getSpots,
  });
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

/** Files a submission and refreshes the list so the new spot appears under the athlete's profile. */
export function useCreateSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submission: SpotSubmission) => createSpot(submission),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: spotsQueryKeys.lists() });
    },
  });
}

/**
 * Saves an owner's edits and refreshes the spot and the list.
 *
 * Refetched rather than patched from the mutation's return value: the save resets the status to
 * under review, and only a refetched row is guaranteed to agree with what the database now holds.
 */
export function useUpdateSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spotId, edits }: { spotId: string; edits: SpotEdits }) =>
      updateSpot(spotId, edits),
    onSuccess: async (_spot, { spotId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: spotsQueryKeys.detail(spotId) }),
        queryClient.invalidateQueries({ queryKey: spotsQueryKeys.lists() }),
      ]);
    },
  });
}

/** Files a report. Nothing on screen changes, so no cache is touched. */
export function useReportSpotMutation() {
  return useMutation({
    mutationFn: (input: ReportSpotInput) => reportSpot(input),
  });
}
