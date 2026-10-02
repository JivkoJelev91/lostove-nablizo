import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { addFavorite, getFavoriteSpots, removeFavorite } from '@/features/favorites/favorites-api';
import { queryKeys } from '@/lib/query-keys';

/**
 * The keys a saved-spots query lives under.
 *
 * The athlete's id is part of the key, and that is the point. RLS already stops one account reading
 * another's rows, but a query cache is not the database: a key of `['favorites', 'list']` alone
 * would let a signed-out-then-signed-in-as-someone-else launch show the first athlete's saved
 * spots for as long as the entry stayed fresh. Keying by owner means the cache can only ever hand
 * back rows fetched for the account asking.
 */
function favoritesQueryKeys(userId: string) {
  return {
    all: [...queryKeys.favorites.all, userId] as const,
    lists: () => [...queryKeys.favorites.all, userId, 'list'] as const,
  };
}

/** The signed-in athlete's saved spots, or an empty list for a guest. */
export function useFavoriteSpotsQuery() {
  const { user } = useCurrentUser();
  const userId = user?.id ?? null;
  const keys = favoritesQueryKeys(userId ?? 'guest');

  return useQuery({
    queryKey: keys.lists(),
    queryFn: () => getFavoriteSpots(userId ?? ''),
    // A guest has no rows to read, and asking anyway would return a permission error rather than
    // an empty list. Refusing to run is also what keeps the guard's redirect from producing a red
    // screen behind the sign-in prompt.
    enabled: userId !== null,
  });
}

/**
 * Saves and unsaves a spot, as one action.
 *
 * The athlete pressing a heart twice is two opposite requests, so the button decides which by what
 * is already saved and this decides by whether the write succeeds. It is a mutation rather than a
 * local toggle because the heart on a card, the heart on the spot page and the saved list are
 * three views of one row, and only the database can be the one that decides.
 */
export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ spotId, saved }: { spotId: string; saved: boolean }) => {
      const userId = user?.id ?? null;

      if (userId === null) {
        throw new Error('Sign in to save a spot.');
      }

      if (saved) {
        await removeFavorite(userId, spotId);
      } else {
        await addFavorite(userId, spotId);
      }
    },
    onSuccess: async () => {
      const userId = user?.id;

      if (userId === undefined) return;

      await queryClient.invalidateQueries({
        queryKey: favoritesQueryKeys(userId).lists(),
      });
    },
  });
}
