import { supabase } from '@/lib/supabase';
import type { TablesInsert } from '@/lib/supabase';
import { getCurrentUserId } from '@/features/auth/current-user';
import { syncSpotPhotos } from '@/features/photos/photos-api';
import type { ReportReason } from '@/features/reports/report-reasons';
import { resolveEquipmentIds, toSpot } from '@/features/spots/spots-mappers';
import { SPOT_SELECT } from '@/features/spots/spot-select';
import type { SpotWithRelations } from '@/features/spots/spots-mappers';
import type { Coordinate, Spot, SpotEdits, SpotSubmission } from '@/features/spots/types';

/**
 * Replaces a spot's equipment with the submitted set.
 *
 * Delete-then-insert rather than a diff: the submitted set is the whole truth, the table is two
 * rows per spot at most, and a diff has to get partial failures wrong — a half-applied edit would
 * leave the spot showing equipment nobody chose.
 */
async function writeEquipment(
  spotId: string,
  names: readonly string[],
  condition: string,
): Promise<void> {
  const { error: clearError } = await supabase
    .from('spot_equipment')
    .delete()
    .eq('spot_id', spotId);

  if (clearError) throw clearError;

  const resolved = await resolveEquipmentIds(names);

  if (resolved.length === 0) return;

  const rows: TablesInsert<'spot_equipment'>[] = resolved.map(({ equipmentId, quantity }) => ({
    spot_id: spotId,
    equipment_id: equipmentId,
    condition,
    quantity,
  }));

  const { error: insertError } = await supabase.from('spot_equipment').insert(rows);

  if (insertError) throw insertError;
}

/** How many spots one feed page carries. Big enough to fill several screens, small enough to be one cheap response. */
export const FEED_PAGE_SIZE = 20;

/**
 * One page of the directory, newest first, for the feed without a position.
 *
 * The range is the pagination: PostgREST turns it into `offset`/`limit`, and the id tiebreaker
 * keeps the page boundaries stable when two spots share a creation timestamp. Only approved spots
 * are asked for — RLS would also show the caller their own pending ones, and the feed never
 * displayed those anyway.
 */
export async function getSpotsPage(
  offset: number,
  limit: number = FEED_PAGE_SIZE,
): Promise<Spot[]> {
  const { data, error } = await supabase
    .from('spots')
    .select(SPOT_SELECT)
    .eq('status', 'approved')
    .order('created_at', { ascending: false })
    .order('id', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return (data ?? []).map((row) => toSpot(row as SpotWithRelations));
}

/**
 * One page of approved spots within `radiusM` of `origin`, nearest first.
 *
 * The distance ordering and the radius predicate are the database's, measured on the GiST index,
 * and pagination is the function's own `p_limit`/`p_offset` so page one is the nearest spots and
 * page two continues outward. The distance lands in the same `distanceMeters` field the
 * client-side calculation fills, and the display formats both the same way.
 */
export async function getNearbySpots(
  origin: Coordinate,
  radiusM: number,
  offset: number,
  limit: number = FEED_PAGE_SIZE,
): Promise<Spot[]> {
  const { data, error } = await supabase.rpc('nearby_spots', {
    p_latitude: origin.latitude,
    p_longitude: origin.longitude,
    p_offset: offset,
    p_limit: limit,
    p_radius_m: radiusM,
  });

  if (error) throw error;

  // The relation columns arrive as jsonb, which the generated types call `Json`. The function
  // builds exactly the shapes the mapper reads, so this is the one boundary where that is
  // asserted rather than carried through the app as `unknown`.
  return (data ?? []).map((row) => ({
    ...toSpot(row as unknown as SpotWithRelations),
    distanceMeters: row.distance_m,
  }));
}

/**
 * One spot with its equipment and photos, or `null` when there is no such row.
 *
 * The reviews are not embedded here even though the spot page shows them: they come from
 * `useSpotReviewsQuery`, which is the query a review write invalidates, and embedding them too
 * meant fetching and serialising every review twice on every visit.
 *
 * `null` and an error are different answers: a removed or never-existing spot is not a failure,
 * and the screen shows the same "not found" for both a wrong id and a spot moderation closed.
 */
export async function getSpotById(spotId: string): Promise<Spot | null> {
  const { data, error } = await supabase
    .from('spots')
    .select(SPOT_SELECT)
    .eq('id', spotId)
    .maybeSingle();

  if (error) throw error;

  return data === null ? null : toSpot(data as SpotWithRelations);
}

/** The shortest term the database will search on; a shorter one matches nothing. */
export const SEARCH_MIN_QUERY_LENGTH = 2;

/**
 * Thrown when a spot edit's fields landed but one or more of its new photos did not upload.
 *
 * A distinct type because the two halves of the save have different outcomes: the name, the
 * equipment and the removed photos are already stored, so the screen must ask for a retry without
 * telling the athlete their whole edit was lost.
 */
export class SpotPhotoUploadError extends Error {
  constructor() {
    super('Some photos could not be uploaded.');
    this.name = 'SpotPhotoUploadError';
  }
}

/** Narrows a caught value to {@link SpotPhotoUploadError}. */
export function isSpotPhotoUploadError(value: unknown): value is SpotPhotoUploadError {
  return value instanceof SpotPhotoUploadError;
}

/**
 * Approved spots whose name or description contains `query`, best match first.
 *
 * The work is the database's: `search_spots` runs a trigram-indexed substring match and returns
 * the same card shape `nearby_spots` does, so a result needs no second request. The client never
 * downloads the directory to filter it — that is what the function replaces.
 */
export async function searchSpots(query: string): Promise<Spot[]> {
  const { data, error } = await supabase.rpc('search_spots', { p_query: query.trim() });

  if (error) throw error;

  return (data ?? []).map((row) => toSpot(row as unknown as SpotWithRelations));
}

/**
 * Records a submission as waiting for review and returns the stored spot.
 *
 * The owner is the signed-in account rather than a passed-in id: a client that could name its own
 * owner would let anyone file a spot under somebody else's name, so the id comes from the
 * session the RLS policy already checks.
 */
export async function createSpot(submission: SpotSubmission): Promise<Spot> {
  const ownerId = await getCurrentUserId();

  if (ownerId === null) {
    throw new Error('Sign in to add a spot.');
  }

  // `status` and `source` are deliberately absent. The column grant for insert names five columns
  // and those are not among them, so sending them is rejected outright; the row lands as 'pending'
  // from the column default, which is the same value the insert policy's `with check` demands. The
  // database deciding this, rather than the client asking for it, is the point: a client that
  // could name `status` here could also name 'approved', and there is no grant that can tell those
  // two requests apart.
  const { data: created, error: createError } = await supabase
    .from('spots')
    .insert({
      name: submission.name.trim(),
      description: submission.description.trim(),
      latitude: submission.coordinate.latitude,
      longitude: submission.coordinate.longitude,
      created_by: ownerId,
    })
    .select('id')
    .single();

  if (createError) throw createError;

  const names = submission.equipment.map((item) => item.name);

  await writeEquipment(created.id, names, 'good');

  const spot = await getSpotById(created.id);

  if (spot === null) throw new Error('The spot was saved but could not be read back.');

  return spot;
}

/**
 * Applies an owner's edits and puts the spot back under review.
 *
 * `status` is not written here, and that is the point. The update grant names four columns and
 * `status` is not one of them, and widening the grant would let an owner raise their own
 * submission's status to 'approved' — the update policy says "is this your spot?" and nothing
 * about which state it may move to. The `spots_reset_status_on_edit` trigger forces the status
 * back to pending whenever the content a moderator approves actually changes, so the rule holds
 * no matter what the client sends.
 *
 * The coordinate is not editable and is not written. Photos are synced rather than written:
 * the draft names which stored rows stay, and the new local files are uploaded before the rows
 * the draft dropped are deleted.
 */
export async function updateSpot(spotId: string, edits: SpotEdits): Promise<Spot> {
  const { error: updateError } = await supabase
    .from('spots')
    .update({
      name: edits.name.trim(),
      description: edits.description.trim(),
    })
    .eq('id', spotId);

  if (updateError) throw updateError;

  const names = edits.equipment.map((item) => item.name);

  await writeEquipment(spotId, names, edits.condition);

  const photos = await syncSpotPhotos(spotId, edits.photos);

  if (photos.failed.length > 0) {
    throw new SpotPhotoUploadError();
  }

  const spot = await getSpotById(spotId);

  if (spot === null) throw new Error('The spot was saved but could not be read back.');

  return spot;
}

/** Every spot this athlete added, whatever its moderation state, newest first. */
export async function getOwnedSpots(ownerId: string): Promise<Spot[]> {
  const { data, error } = await supabase
    .from('spots')
    .select(SPOT_SELECT)
    .eq('created_by', ownerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => toSpot(row as SpotWithRelations));
}

export type ReportSpotInput = {
  spotId: string;
  reason: ReportReason;
  /** What is wrong with the spot, when the reason alone does not say it. */
  description?: string;
};

/**
 * Records that the signed-in athlete confirmed an approved spot still exists.
 *
 * The athlete is the session, never a field on the input, and the database does both halves --
 * the confirmation row and the spot's new verification date -- inside one function, so the two
 * cannot disagree about who verified what and when. A repeat confirmation is not an error: the
 * function refreshes the athlete's row and the spot's date rather than counting the tap twice.
 */
export async function verifySpot(spotId: string): Promise<void> {
  const { error } = await supabase.rpc('verify_spot', { p_spot_id: spotId });

  if (error) throw error;
}

/**
 * Files a report against a spot.
 *
 * The reporter is the session, never a field on the input, so a report cannot be filed under
 * somebody else's account. RLS rejects the write for a guest; the check here turns that into a
 * message the screen can show instead of a raw policy error.
 */
export async function reportSpot({ spotId, reason, description }: ReportSpotInput): Promise<void> {
  const reporterId = await getCurrentUserId();

  if (reporterId === null) {
    throw new Error('Sign in to report a spot.');
  }

  const { error } = await supabase.from('reports').insert({
    spot_id: spotId,
    user_id: reporterId,
    reason,
    description: description?.trim() ?? null,
  });

  if (error === null) return;

  // 23505 is the one-report-per-athlete-per-spot index: a second report is not a failure, it is
  // the report they already filed.
  if (error.code === '23505') return;

  throw error;
}
