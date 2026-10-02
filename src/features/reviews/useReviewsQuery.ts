import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { displayNameFromUser, FALLBACK_USERNAME } from '@/features/auth/identity';
import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { reviewDraftSchema } from '@/features/reviews/review-schema';
import { toSpotReviews } from '@/features/spots/spots-mappers';
import type { SpotReview } from '@/features/spots/types';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

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

type WriteReviewVariables = {
  rating: number;
  text: string;
};

/** What the optimistic update replaced, so a failed write can put it back. */
type WriteContext = {
  previous: SpotReview[] | undefined;
};

/**
 * The one write the spot page performs: this athlete's review of one spot.
 *
 * One review per athlete per spot is a database rule, so the write is an upsert against the
 * `(spot_id, user_id)` conflict rather than a read-then-write that could race itself.
 *
 * The list is updated optimistically because that is the safe part: the row the athlete just
 * wrote is theirs to show immediately, and a failure rolls the list back to what it held before.
 * The spot's average and count are deliberately *not* faked — `recompute_spot_rating` owns them,
 * and guessing at them on the client would be a second source of truth. The refetch after the
 * write brings both the list and the aggregate in step.
 */
function useWriteReview(spotId: string | null) {
  const queryClient = useQueryClient();
  const { profile, user } = useCurrentUser();
  const key = queryKeys.reviews.bySpot(spotId ?? '');

  return useMutation({
    mutationFn: async ({ rating, text }: WriteReviewVariables) => {
      if (user === null) {
        throw new Error('Sign in to review this spot.');
      }

      const parsed = reviewDraftSchema.safeParse({ rating, text: text.trim() });

      if (!parsed.success) {
        throw new Error('The review is invalid.');
      }

      const { error } = await supabase.from('reviews').upsert(
        {
          spot_id: spotId ?? '',
          user_id: user.id,
          rating: parsed.data.rating,
          comment: parsed.data.text === '' ? null : parsed.data.text,
        },
        { onConflict: 'spot_id,user_id' },
      );

      if (error) throw error;
    },
    onMutate: async ({ rating, text }): Promise<WriteContext> => {
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<SpotReview[]>(key);

      if (user !== null) {
        const authorName = profile?.username ?? displayNameFromUser(user) ?? FALLBACK_USERNAME;
        const optimistic: SpotReview = {
          authorId: user.id,
          authorName,
          date: new Date(),
          id: previous?.find((review) => review.authorId === user.id)?.id ?? `optimistic-${spotId}`,
          rating,
          spotId: spotId ?? '',
          text: text.trim(),
        };

        queryClient.setQueryData<SpotReview[]>(key, (current) => {
          const list = current ?? [];
          const hasOwn = list.some((review) => review.authorId === user.id);

          return hasOwn
            ? list.map((review) => (review.authorId === user.id ? optimistic : review))
            : [optimistic, ...list];
        });
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: key }),
        // The spot row carries the average and the count the header shows.
        queryClient.invalidateQueries({ queryKey: queryKeys.spots.detail(spotId ?? '') }),
      ]);
    },
  });
}

/** The reviews of one spot as the spot page needs them, plus the one write it performs. */
export type SpotReviews = {
  reviews: readonly SpotReview[];
  /** This athlete's own review, kept out of the list so the page can label it separately. */
  ownReview: SpotReview | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  /** Writes or replaces this athlete's review, one per spot as the database requires. */
  writeReview: (rating: number, text: string) => Promise<void>;
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
  const { user } = useCurrentUser();
  const write = useWriteReview(spotId);

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
      writeReview: (rating, text) => write.mutateAsync({ rating, text }),
      isSaving: write.isPending,
    }),
    [query.data, query.isLoading, query.isError, refetch, user?.id, write],
  );
}
