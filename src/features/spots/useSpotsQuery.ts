import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  createSpot,
  getSpotById,
  getSpots,
  reportSpot,
  updateSpot,
} from '@/features/spots/spots-api';
import type { ReportSpotInput } from '@/features/spots/spots-api';
import type { SpotEdits, SpotSubmission, Spot } from '@/features/spots/types';
import { queryKeys } from '@/lib/query-keys';

export const spotsQueryKeys = queryKeys.spots;

export function useSpotsQuery() {
  return useQuery({
    queryKey: spotsQueryKeys.lists(),
    queryFn: getSpots,
  });
}

export function useSpotQuery(spotId: string | undefined) {
  return useQuery({
    queryKey: spotId ? spotsQueryKeys.detail(spotId) : spotsQueryKeys.details(),
    queryFn: () => {
      if (!spotId) return Promise.reject(new Error('Spot ID is required'));
      return getSpotById(spotId);
    },
    enabled: !!spotId,
  });
}

export function useCreateSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submission: SpotSubmission) => createSpot(submission),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: spotsQueryKeys.lists() });
    },
    onSuccess: (newSpot) => {
      queryClient.setQueryData<Spot[]>(spotsQueryKeys.lists(), (old = []) => [newSpot, ...old]);
      queryClient.invalidateQueries({ queryKey: spotsQueryKeys.lists() });
    },
    onError: () => {
      queryClient.invalidateQueries({ queryKey: spotsQueryKeys.lists() });
    },
  });
}

export function useUpdateSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ spotId, edits }: { spotId: string; edits: SpotEdits }) =>
      updateSpot(spotId, edits),
    onMutate: async ({ spotId, edits }) => {
      await Promise.all([
        queryClient.cancelQueries({ queryKey: spotsQueryKeys.detail(spotId) }),
        queryClient.cancelQueries({ queryKey: spotsQueryKeys.lists() }),
      ]);

      const previousSpot = queryClient.getQueryData<Spot>(spotsQueryKeys.detail(spotId));
      const previousList = queryClient.getQueryData<Spot[]>(spotsQueryKeys.lists());

      if (previousSpot) {
        queryClient.setQueryData<Spot>(spotsQueryKeys.detail(spotId), {
          ...previousSpot,
          ...edits,
          status: 'under_review' as Spot['status'],
        });
      }

      if (previousList) {
        queryClient.setQueryData<Spot[]>(
          spotsQueryKeys.lists(),
          previousList.map((s) =>
            s.id === spotId ? { ...s, ...edits, status: 'under_review' as Spot['status'] } : s,
          ),
        );
      }

      return { previousSpot, previousList, spotId };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.previousSpot) {
        queryClient.setQueryData(spotsQueryKeys.detail(ctx.spotId), ctx.previousSpot);
      }
      if (ctx?.previousList) {
        queryClient.setQueryData(spotsQueryKeys.lists(), ctx.previousList);
      }
    },
    onSettled: (_data, _err, vars) => {
      queryClient.invalidateQueries({ queryKey: spotsQueryKeys.detail(vars.spotId) });
      queryClient.invalidateQueries({ queryKey: spotsQueryKeys.lists() });
    },
  });
}

export function useReportSpotMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ReportSpotInput) => reportSpot(input),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: spotsQueryKeys.detail(variables.spotId) });
    },
  });
}
