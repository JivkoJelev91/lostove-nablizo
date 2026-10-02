import { createContext, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';

import { useRequireAuth } from '@/features/auth/useRequireAuth';
import {
  useFavoriteSpotsQuery,
  useToggleFavoriteMutation,
} from '@/features/favorites/useFavoritesQuery';
import type { Spot } from '@/features/spots/types';

export type FavoritesValue = {
  /** The saved spots, which is how the discovery feed orders them. */
  spots: readonly Spot[];
  isFavorite: (spotId: string) => boolean;
  /**
   * Saves or unsaves a spot, and sends a guest to sign in first.
   *
   * The whole spot travels, not just its id: saving one adds it to the saved list optimistically,
   * and a list entry needs the card's data rather than a placeholder.
   *
   * Returns whether the write was started, so a caller knows not to show its own confirmation.
   */
  toggle: (spot: Spot) => void;
  /** The saved list is loading, so a screen can show a spinner instead of an empty list. */
  loading: boolean;
  /** A failed read, distinct from an empty list: the screen offers a retry for this. */
  error: boolean;
  /** Re-reads the saved list, for a pull-to-refresh or a retry. */
  refetch: () => void;
  /** Whether a refetch is in flight, for `RefreshControl`. */
  refreshing: boolean;
  signedIn: boolean;
};

/** Null until a provider is above it, so the hook can tell a missing provider from no favourites. */
export const FavoritesContext = createContext<FavoritesValue | null>(null);

/**
 * Owns which spots the athlete has saved.
 *
 * A saved spot belongs to the athlete, not to a screen: the heart in the feed, the heart on the
 * spot page and the list on this tab are three views of one fact. Keeping them here means those
 * three cannot disagree.
 *
 * The rows are the athlete's own, read from the database and scoped to their id — a guest gets an
 * empty list rather than a seeded one, because showing somebody a saved list they did not save is
 * the same as showing them somebody else's data.
 *
 * The toggle asks `useRequireAuth` first. The heart stays visible to a guest on purpose: a
 * control that vanishes cannot explain itself, and the athlete needs to learn that saving exists
 * before being told they must sign in to use it.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { data, isLoading, isFetching, isError, refetch } = useFavoriteSpotsQuery();
  const { mutate } = useToggleFavoriteMutation();
  const { requireAuth, signedIn } = useRequireAuth();

  const spots = useMemo<readonly Spot[]>(() => data ?? [], [data]);

  const savedIds = useMemo(() => new Set(spots.map((spot) => spot.id)), [spots]);

  const isFavorite = useCallback((spotId: string) => savedIds.has(spotId), [savedIds]);

  const toggle = useCallback(
    (spot: Spot) => {
      requireAuth(() => {
        mutate({ saved: savedIds.has(spot.id), spot });
      });
    },
    [mutate, requireAuth, savedIds],
  );

  const value = useMemo<FavoritesValue>(
    () => ({
      error: isError,
      isFavorite,
      loading: isLoading || isFetching,
      refetch: () => void refetch(),
      refreshing: isFetching,
      spots,
      toggle,
      signedIn,
    }),
    [isError, isFavorite, isLoading, isFetching, refetch, spots, toggle, signedIn],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
