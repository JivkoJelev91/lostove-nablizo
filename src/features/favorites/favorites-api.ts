import { supabase } from '@/lib/supabase';
import { SPOT_SELECT } from '@/features/spots/spot-select';
import { toSpot } from '@/features/spots/spots-mappers';
import type { SpotWithRelations } from '@/features/spots/spots-mappers';
import type { Spot } from '@/features/spots/types';

/**
 * The spots the athlete has saved, newest first, approved only.
 *
 * A favourite is private to its owner, so this is the athlete's own list and nothing else. It
 * resolves against `spots` with the same relation shape the discovery list uses, which is what
 * lets a saved spot render as a full card rather than a name and a heart.
 *
 * The row survives moderation on purpose — a rejected spot that is approved again comes back on
 * its own — but it is not shown while it is not public. Without this filter the owner's own
 * rejected submission appeared here looking exactly like a visitable place, because RLS lets them
 * read their own rows; the profile's "Твоите места" is where submissions carry their status.
 */
export async function getFavoriteSpots(userId: string): Promise<Spot[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select(
      `
      spot_id,
      spots ( ${SPOT_SELECT} )
      `,
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? [])
    .map((row) => {
      // The relation is nullable from PostgREST's point of view: a favourite whose spot was
      // removed by moderation has no row to embed. Skip it rather than render a card with no name.
      const spot = row.spots as unknown as SpotWithRelations | null;

      return spot === null ? null : toSpot(spot);
    })
    .filter((spot): spot is Spot => spot !== null)
    .filter((spot) => spot.status === 'approved');
}

/**
 * Saves a spot for the athlete.
 *
 * The row is a pure (user, spot) membership: the table's primary key is the pair, so saving a spot
 * twice is a duplicate-key error rather than a second row. That error is folded into "already
 * saved" here, because from the athlete's side pressing the heart twice means the same thing
 * either way and a raw Postgres code is not a message they can act on.
 */
export async function addFavorite(userId: string, spotId: string): Promise<void> {
  const { error } = await supabase.from('favorites').insert({ spot_id: spotId, user_id: userId });

  if (error === null) return;

  // 23505 is unique_violation, which is what the composite primary key raises on a repeat save.
  if (error.code === '23505') return;

  throw error;
}

/** Removes a saved spot. Removing one that is not saved is not an error worth surfacing. */
export async function removeFavorite(userId: string, spotId: string): Promise<void> {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('spot_id', spotId);

  if (error) throw error;
}
