import { useQuery } from '@tanstack/react-query';

import { toSpotReview } from '@/features/spots/spots-mappers';
import type { SpotReview } from '@/features/spots/types';
import { supabase } from '@/lib/supabase';
import { queryKeys } from '@/lib/query-keys';

const OWN_REVIEWS_SELECT = `
  id,
  rating,
  comment,
  created_at,
  updated_at,
  spot_id,
  user_id,
  profiles ( username ),
  spots ( name )
`;

/** One of the athlete's reviews with the spot it is about, for the profile's list. */
export type OwnReview = SpotReview & {
  spotName: string | null;
};

/**
 * Every review the signed-in athlete wrote, newest first.
 *
 * The spot's name travels with the review rather than being looked up per card: the profile list
 * is about the athlete's own writing, and a second request per row is how the name and the review
 * start disagreeing. Disabled for a guest — there is no author to ask about.
 */
export function useOwnReviewsQuery(userId: string | null) {
  return useQuery({
    queryKey: queryKeys.reviews.byUser(userId ?? ''),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(OWN_REVIEWS_SELECT)
        .eq('user_id', userId ?? '')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data ?? []).map((row): OwnReview => ({
        ...toSpotReview(row),
        spotName: row.spots?.name ?? null,
      }));
    },
    enabled: userId !== null,
  });
}
