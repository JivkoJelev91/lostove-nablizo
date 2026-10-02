import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { QueryClient } from '@tanstack/react-query';

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

/** What an optimistic update replaced, so a failed mutation can put it back. */
type ReviewContext = {
  previous: SpotReview[] | undefined;
};

/**
 * Every cache a review write or delete makes stale: every review list — the spot's and the
 * athlete's own — and the spot rows whose cached average and count the database has just
 * recomputed.
 */
async function invalidateReviewCaches(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.all }),
    queryClient.invalidateQueries({ queryKey: queryKeys.spots.all }),
  ]);
}

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

      const spot = spotId ?? '';
      const values = {
        rating: parsed.data.rating,
        comment: parsed.data.text === '' ? null : parsed.data.text,
      };

      // Deliberately not an upsert: `INSERT ... ON CONFLICT DO UPDATE` needs a table-wide UPDATE
      // privilege, and the grants on `reviews` are column-narrow (rating, comment). Reading the
      // row first and then writing keeps that grant; the unique key still makes the race safe,
      // because a concurrent insert loses to 23505 and is retried as the update it is.
      const existing = await supabase
        .from('reviews')
        .select('id')
        .eq('spot_id', spot)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing.error) throw existing.error;

      if (existing.data === null) {
        const { error } = await supabase
          .from('reviews')
          .insert({ spot_id: spot, user_id: user.id, ...values });

        if (error !== null && error.code !== '23505') throw error;
        if (error === null) return;
      }

      const { error: updateError } = await supabase
        .from('reviews')
        .update(values)
        .eq('spot_id', spot)
        .eq('user_id', user.id);

      if (updateError) throw updateError;
    },
    onMutate: async ({ rating, text }): Promise<ReviewContext> => {
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
      await invalidateReviewCaches(queryClient);
    },
  });
}

/**
 * Removes this athlete's review of one spot.
 *
 * Keyed by `(spot_id, user_id)` rather than by row id, for the same reason the write is an
 * upsert: the pair is what the athlete is allowed to touch, and it cannot name somebody else's
 * row even by mistake. The list drops the review immediately and puts it back if the delete
 * fails; the recomputed average follows the refetch.
 */
function useDeleteReview(spotId: string | null) {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();
  const key = queryKeys.reviews.bySpot(spotId ?? '');

  return useMutation({
    mutationFn: async () => {
      if (user === null) {
        throw new Error('Sign in to delete your review.');
      }

      const { error } = await supabase
        .from('reviews')
        .delete()
        .eq('spot_id', spotId ?? '')
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onMutate: async (): Promise<ReviewContext> => {
      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<SpotReview[]>(key);

      if (user !== null) {
        queryClient.setQueryData<SpotReview[]>(key, (current) =>
          (current ?? []).filter((review) => review.authorId !== user.id),
        );
      }

      return { previous };
    },
    onError: (_error, _variables, context) => {
      if (context !== undefined) {
        queryClient.setQueryData(key, context.previous);
      }
    },
    onSettled: async () => {
      await invalidateReviewCaches(queryClient);
    },
  });
}

/** The reviews of one spot as the spot page needs them, plus the writes it performs. */
export type SpotReviews = {
  reviews: readonly SpotReview[];
  /** This athlete's own review, kept out of the list so the page can label it separately. */
  ownReview: SpotReview | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  /** Writes or replaces this athlete's review, one per spot as the database requires. */
  writeReview: (rating: number, text: string) => Promise<void>;
  /** Removes this athlete's review of the spot. */
  deleteReview: () => Promise<void>;
  isSaving: boolean;
  isDeleting: boolean;
};

/**
 * Loads the reviews on a spot and exposes the writes the spot page performs.
 *
 * The aggregate rating is not touched here: `recompute_spot_rating` in the database owns it, so
 * after a write both this list and the spot row are refetched rather than recalculated on the
 * client, where the two could disagree.
 */
export function useSpotReviewsQuery(spotId: string | null): SpotReviews {
  const { user } = useCurrentUser();
  const write = useWriteReview(spotId);
  const remove = useDeleteReview(spotId);

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
      deleteReview: () => remove.mutateAsync(),
      isSaving: write.isPending,
      isDeleting: remove.isPending,
    }),
    [query.data, query.isLoading, query.isError, refetch, user?.id, write, remove],
  );
}
