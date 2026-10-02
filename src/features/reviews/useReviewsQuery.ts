import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';
import { toSpotReviews } from '@/features/spots/spots-mappers';
import type { SpotReview } from '@/features/spots/types';
import { useCurrentUser } from '@/features/auth/useCurrentUser';

const REVIEWS_SELECT = `
  id,
  rating,
  comment,
  created_at,
  updated_at,
  spot_id,
  user_id,
  profiles ( username )
`;

/** The reviews of one spot as the spot page needs them, plus the one write it performs. */
export type SpotReviews = {
  reviews: readonly SpotReview[];
  /** This athlete's own review, kept out of the list so the page can label it separately. */
  ownReview: SpotReview | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  /** Writes or replaces this athlete's review, one per spot as the database requires. */
  writeReview: (rating: number, text: string) => void;
  isSaving: boolean;
};

/**
 * Loads the reviews on a spot and exposes the one write the spot page performs.
 *
 * The aggregate rating is not touched here: `recompute_spot_rating` in the database owns it, so
 * after a write both this list and the spot row are refetched rather than recalculated on the
 * client, where the two could disagree.
 */
export function useSpotReviewsQuery(spotId: string | null): SpotReviews {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  const query = useQuery({
    queryKey: queryKeys.reviews.bySpot(spotId ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(REVIEWS_SELECT)
        .eq('spot_id', spotId ?? '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return toSpotReviews(data);
    },
    enabled: spotId !== null,
  });

  const write = useMutation({
    mutationFn: async ({ rating, text }: { rating: number; text: string }) => {
      if (user === null) {
        throw new Error('Sign in to review this spot.');
      }

      // One review per athlete per spot, so this is an upsert. The unique index on
      // (spot_id, user_id) makes the conflict the thing to write against rather than something to
      // check first and race with.
      const { error } = await supabase.from('reviews').upsert(
        {
          spot_id: spotId ?? '',
          user_id: user.id,
          rating,
          comment: text.trim() === '' ? null : text.trim(),
        },
        { onConflict: 'spot_id,user_id' },
      );

      if (error) throw error;
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reviews.bySpot(spotId ?? '') }),
        // The spot row carries the average and the count the header shows.
        queryClient.invalidateQueries({ queryKey: queryKeys.spots.detail(spotId ?? '') }),
      ]);
    },
  });

  const refetch = useCallback(() => {
    void query.refetch();
  }, [query]);

  return useMemo(
    () => ({
      reviews: query.data ?? [],
      // By account, not by name: two athletes can share a handle, and the wrong one being labelled
      // "your review" is an edit that overwrites somebody else's.
      ownReview: (query.data ?? []).find((review) => review.authorId === user?.id),
      isLoading: query.isLoading,
      isError: query.isError,
      refetch,
      writeReview: (rating, text) => {
        write.mutate({ rating, text });
      },
      isSaving: write.isPending,
    }),
    [query.data, query.isLoading, query.isError, refetch, user?.id, write],
  );
}
