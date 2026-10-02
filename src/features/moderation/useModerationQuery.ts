import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/features/auth/useCurrentUser';
import {
  amIModerator,
  deleteSpotAsModerator,
  getModerationReports,
  getPendingSpots,
  getRejectedSpots,
  moderateSpot,
  setReportStatus,
} from '@/features/moderation/moderation-api';
import type { ReportStatus } from '@/features/moderation/moderation-api';
import { queryKeys } from '@/lib/query-keys';

/** How long the moderator answer is trusted before the database is asked again. */
const MODERATOR_STALE_TIME_MS = 5 * 60_000;

/**
 * Whether the signed-in caller is a moderator.
 *
 * Disabled for a guest, and the flag it returns decides what the settings screen offers and
 * whether the queue and the edit screen open at all — so the answer, not a client toggle, is
 * what every gate reads.
 */
export function useIsModeratorQuery() {
  const { user } = useCurrentUser();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: queryKeys.moderation.mine(userId ?? 'guest'),
    queryFn: amIModerator,
    enabled: userId !== null,
    staleTime: MODERATOR_STALE_TIME_MS,
  });
}

/** The moderation queue: every report, newest first. */
export function useModerationReportsQuery() {
  const { user } = useCurrentUser();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: queryKeys.moderation.reports(userId ?? 'guest'),
    queryFn: getModerationReports,
    enabled: userId !== null,
    // A queue is only useful if it is current: entering the screen asks the database again
    // instead of serving a minute-old list that misses a report filed since.
    refetchOnMount: 'always',
  });
}

/** Submissions waiting for approval, oldest first, so the oldest does not wait forever. */
export function usePendingSpotsQuery() {
  const { user } = useCurrentUser();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: queryKeys.moderation.pending(userId ?? 'guest'),
    queryFn: getPendingSpots,
    enabled: userId !== null,
    refetchOnMount: 'always',
  });
}

/** Rejected spots, newest first, for the cleanup list. */
export function useRejectedSpotsQuery() {
  const { user } = useCurrentUser();
  const userId = user?.id ?? null;

  return useQuery({
    queryKey: queryKeys.moderation.rejected(userId ?? 'guest'),
    queryFn: getRejectedSpots,
    enabled: userId !== null,
    refetchOnMount: 'always',
  });
}

/** Approves, rejects, closes or reopens a spot, refreshing every surface the change touches. */
export function useModerateSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      spotId,
      status,
    }: {
      spotId: string;
      status: 'approved' | 'rejected' | 'closed';
    }) => moderateSpot(spotId, status),
    onSuccess: async (_data, { spotId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.moderation.reportsRoot() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.moderation.pendingRoot() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.moderation.rejectedRoot() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.spots.detail(spotId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.spots.all }),
      ]);
    },
  });
}

/** Deletes a rejected spot and its photos for good, refreshing every queue that named it. */
export function useDeleteSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (spotId: string) => deleteSpotAsModerator(spotId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.moderation.rejectedRoot() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.moderation.reportsRoot() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.spots.all }),
      ]);
    },
  });
}

/** Marks a report resolved or dismissed. */
export function useSetReportStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reportId, status }: { reportId: string; status: ReportStatus }) =>
      setReportStatus(reportId, status),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.moderation.reportsRoot() });
    },
  });
}
