import type { ImageSourcePropType } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import type { EquipmentCondition, SpotEquipment, SpotStatus } from '@/components';
import { SPOT_PHOTO } from '@/features/spots/spot-photos';
import type { Coordinate, Spot, SpotReview } from '@/features/spots/types';

type SpotRow = Tables<'spots'>;
type SpotEquipmentRow = Tables<'spot_equipment'>;
type PhotoRow = Tables<'photos'>;
type EquipmentRow = Tables<'equipment'>;
type ReviewRow = Tables<'reviews'>;
type ProfileRow = Tables<'profiles'>;

/**
 * A spot row with the three relations the screens need to render it: its equipment, its photos
 * and, on the detail query, the reviews behind its rating.
 */
export type SpotWithRelations = SpotRow & {
  spot_equipment?: (SpotEquipmentRow & { equipment?: EquipmentRow | null })[];
  photos?: PhotoRow[];
  reviews?: (ReviewRow & { profiles?: ProfileRow | null })[];
};

/**
 * The database's `spots.status` values, mapped onto the ones the app renders.
 *
 * The two sets are named differently on purpose: the database says `pending`, which describes the
 * moderation queue's business, and the app says `under_review`, which describes what the athlete
 * is shown. Keeping the mapping here rather than renaming either side is what stops the column's
 * vocabulary leaking into components that only ever speak the app's.
 */
const STATUS_BY_DATABASE_VALUE: Record<string, SpotStatus> = {
  pending: 'under_review',
  approved: 'approved',
  rejected: 'rejected',
  closed: 'closed',
};

/**
 * Narrows the `status` text column to the states the app renders.
 *
 * The column is a plain `string`, so a moderation state added by a later migration arrives as
 * something no badge knows how to draw. Treating it as `under_review` is the honest reading: the
 * spot has not been cleared for the public, which is the only thing the badge can say for sure.
 */
export function toSpotStatus(status: string | null | undefined): SpotStatus {
  return (status === null || status === undefined ? undefined : STATUS_BY_DATABASE_VALUE[status]) ?? 'under_review';
}

const CONDITIONS: readonly EquipmentCondition[] = ['good', 'worn', 'damaged'];

/** Narrows an equipment's `condition` text, defaulting to `good` for anything unrecognised. */
export function toCondition(condition: string | null | undefined): EquipmentCondition {
  const match = CONDITIONS.find((candidate) => candidate === condition);

  return match ?? 'good';
}

/**
 * The overall condition shown on the spot page, read off the equipment rather than stored.
 *
 * One damaged item is what an athlete needs to know about, so the worst condition on the spot
 * wins: a spot is not "good" because most of its bars are fine while one set is rusted through.
 */
function overallCondition(
  rows: (SpotEquipmentRow & { equipment?: EquipmentRow | null })[] | undefined,
): EquipmentCondition {
  const conditions = (rows ?? []).map((row) => toCondition(row.condition));

  if (conditions.includes('damaged')) return 'damaged';
  if (conditions.includes('worn')) return 'worn';

  return 'good';
}

/**
 * The equipment tiles, keeping the row's quantity.
 *
 * The name is passed through as the database spells it rather than mapped onto the seven names
 * the icon map knows: a name outside that set still has to render as text, and rewriting it to
 * something the icons happen to cover would show a bar the athlete never claimed.
 */
function toEquipment(
  rows: (SpotEquipmentRow & { equipment?: EquipmentRow | null })[] | undefined,
): SpotEquipment[] {
  return (rows ?? [])
    .map((row) => {
      const name = row.equipment?.name;

      if (name === null || name === undefined || name.trim().length === 0) return null;

      return row.quantity > 1 ? { name, quantity: row.quantity } : { name };
    })
    .filter((item): item is SpotEquipment => item !== null);
}

/** Turns a storage path into the public URL the gallery loads, falling back to the stand-in. */
function photoSource(storagePath: string): ImageSourcePropType {
  const { data } = supabase.storage.from('photos').getPublicUrl(storagePath);

  return data.publicUrl ? { uri: data.publicUrl } : SPOT_PHOTO;
}

/** The gallery, oldest first, so the first photo a contributor uploaded is the cover. */
function toImages(photos: PhotoRow[] | undefined): readonly ImageSourcePropType[] {
  const ordered = [...(photos ?? [])].sort(
    (first, second) =>
      new Date(first.created_at).getTime() - new Date(second.created_at).getTime(),
  );

  return ordered.length === 0 ? [SPOT_PHOTO] : ordered.map((photo) => photoSource(photo.storage_path));
}

/**
 * A review row with the author's profile joined onto it, which may be absent for a deleted account.
 *
 * Only the handle is selected, so the join carries a pick rather than the whole profile row: the
 * rest of the profile is not public to a reader and is not needed to label a review.
 */
export type ReviewWithAuthor = ReviewRow & {
  profiles?: Pick<ProfileRow, 'username'> | null;
};

/** Maps one joined review row onto the shape the spot page lists. */
export function toSpotReview(row: ReviewWithAuthor): SpotReview {
  return {
    id: row.id,
    spotId: row.spot_id,
    authorName: row.profiles?.username ?? '—',
    authorId: row.user_id,
    rating: row.rating,
    text: row.comment ?? '',
    date: new Date(row.created_at),
  };
}

/** The reviews of a spot, newest first. */
export function toSpotReviews(rows: ReviewWithAuthor[] | undefined): SpotReview[] {
  return [...(rows ?? [])]
    .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
    .map(toSpotReview);
}

/**
 * Maps a joined spot row onto the shape every screen renders.
 *
 * The rating is the stored aggregate rather than one recomputed here: `recompute_spot_rating`
 * keeps it in step with the reviews, and a spot with no reviews has a real zero to show instead
 * of a division that never had a denominator.
 *
 * `distanceKm` is zero because the row carries no distance — it is relative to wherever the
 * athlete is, so the list screen computes it after fetching rather than the database pretending
 * to know the reader's position.
 */
export function toSpot(row: SpotWithRelations): Spot {
  const coordinate: Coordinate = { latitude: row.latitude, longitude: row.longitude };

  return {
    id: row.id,
    name: row.name,
    coordinate,
    rating: row.rating_average,
    reviewCount: row.rating_count,
    equipment: toEquipment(row.spot_equipment),
    condition: overallCondition(row.spot_equipment),
    description: row.description ?? '',
    distanceMeters: null,
    images: toImages(row.photos),
    status: toSpotStatus(row.status),
    ...(row.created_by === null ? {} : { ownerId: row.created_by }),
  };
}

/**
 * The equipment a submission names, resolved to the ids the join table stores.
 *
 * The UI works in equipment names and the table in ids, and the two are not the same list: an
 * athlete can pick equipment the catalogue does not have a row for. Those are dropped rather than
 * inserted under a guessed id, so a spot is never credited with a bar nobody defined.
 */
export async function resolveEquipmentIds(
  names: readonly string[],
): Promise<{ equipmentId: string; quantity: number }[]> {
  const unique = [...new Set(names.map((name) => name.trim()).filter((name) => name.length > 0))];

  if (unique.length === 0) return [];

  const { data, error } = await supabase.from('equipment').select('id, name').in('name', unique);

  if (error) throw error;

  return (data ?? []).map((row) => ({ equipmentId: row.id, quantity: 1 }));
}
