import { createContext, useCallback, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { MOCK_FAVORITE_IDS } from '@/features/favorites/mock-favorites';
import { MOCK_SPOTS } from '@/features/spots/mock-spots';
import type { Spot } from '@/features/spots/types';

export type FavoritesValue = {
  /** The saved spots, nearest first, which is how the discovery feed orders them. */
  spots: readonly Spot[];
  isFavorite: (spotId: string) => boolean;
  toggle: (spotId: string) => void;
};

/** Null until a provider is above it, so the hook can tell a missing provider from no favourites. */
export const FavoritesContext = createContext<FavoritesValue | null>(null);

/**
 * Owns which spots the athlete has saved.
 *
 * A saved spot belongs to the athlete, not to a screen: the heart in the feed, the heart on the
 * spot page and the list on this tab are three views of one fact. Keeping the ids here means
 * those three cannot disagree, and it gives one place to swap the mock ids for the signed-in
 * user's rows when Supabase stores them.
 */
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favoriteIds, setFavoriteIds] = useState<readonly string[]>(MOCK_FAVORITE_IDS);

  const spots = useMemo(
    () =>
      MOCK_SPOTS.filter((spot) => favoriteIds.includes(spot.id)).sort(
        (first, second) => first.distanceKm - second.distanceKm,
      ),
    [favoriteIds],
  );

  const isFavorite = useCallback((spotId: string) => favoriteIds.includes(spotId), [favoriteIds]);

  const toggle = useCallback((spotId: string) => {
    setFavoriteIds((previous) =>
      previous.includes(spotId) ? previous.filter((id) => id !== spotId) : [...previous, spotId],
    );
  }, []);

  const value = useMemo<FavoritesValue>(
    () => ({ isFavorite, spots, toggle }),
    [isFavorite, spots, toggle],
  );

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
