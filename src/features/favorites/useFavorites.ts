import { use } from 'react';

import { FavoritesContext } from '@/features/favorites/FavoritesProvider';
import type { FavoritesValue } from '@/features/favorites/FavoritesProvider';

/**
 * Reads the athlete's saved spots. Every screen that shows a heart goes through this, so a spot
 * saved in one place reads as saved everywhere.
 */
export function useFavorites(): FavoritesValue {
  const value = use(FavoritesContext);

  if (value === null) {
    throw new Error('useFavorites needs a FavoritesProvider above it in the tree.');
  }

  return value;
}
