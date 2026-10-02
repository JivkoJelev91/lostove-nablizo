import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCurrentUser } from '@/features/auth/useCurrentUser';
import { addFavorite, getFavoriteSpots, removeFavorite } from '@/features/favorites/favorites-api';
import type { Spot } from '@/features/spots/types';
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
 *
 * The saved list is updated optimistically, because that is what the heart reads: without it the
 * icon would only flip after the refetch, which is the delay the athlete reads as a broken button.
 * The whole spot is carried so a save can put a real card into the list; a failure rolls the list
 * back, and the refetch after the write is the source of truth either way.
 */
export function useToggleFavoriteMutation() {
  const queryClient = useQueryClient();
  const { user } = useCurrentUser();

  return useMutation({
    mutationFn: async ({ spot, saved }: { spot: Spot; saved: boolean }) => {
      const userId = user?.id ?? null;

      if (userId === null) {
        throw new Error('Sign in to save a spot.');
      }

      if (saved) {
        await removeFavorite(userId, spot.id);
      } else {
        await addFavorite(userId, spot.id);
      }
    },
    onMutate: async ({ spot, saved }) => {
      const userId = user?.id;

      if (userId === undefined) {
        return { previous: undefined };
      }

      const key = favoritesQueryKeys(userId).lists();

      await queryClient.cancelQueries({ queryKey: key });

      const previous = queryClient.getQueryData<Spot[]>(key);

      queryClient.setQueryData<Spot[]>(key, (current) => {
        const list = current ?? [];

        if (saved) {
          return list.filter((item) => item.id !== spot.id);
        }

        return list.some((item) => item.id === spot.id) ? list : [spot, ...list];
      });

      return { previous };
    },
    onError: (_error, _variables, context) => {
      const userId = user?.id;

      if (userId === undefined || context === undefined || context.previous === undefined) {
        return;
      }

      queryClient.setQueryData(favoritesQueryKeys(userId).lists(), context.previous);
    },
    onSettled: async () => {
      const userId = user?.id;

      if (userId === undefined) return;

      await queryClient.invalidateQueries({
        queryKey: favoritesQueryKeys(userId).lists(),
      });
    },
  });
}
