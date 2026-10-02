import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/features/auth/useCurrentUser';
import {
  amIModerator,
  getModerationReports,
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
  });
}

/** Closes or reopens a spot, and refreshes every spot surface the change touches. */
export function useModerateSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spotId, status }: { spotId: string; status: 'closed' | 'approved' }) =>
      moderateSpot(spotId, status),
    onSuccess: async (_data, { spotId }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.moderation.reportsRoot() }),
        queryClient.invalidateQueries({ queryKey: queryKeys.spots.detail(spotId) }),
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
