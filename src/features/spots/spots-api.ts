import { supabase } from '@/lib/supabase';
import type { TablesInsert } from '@/lib/supabase';
import { resolveEquipmentIds, toSpot } from '@/features/spots/spots-mappers';
import { SPOT_SELECT } from '@/features/spots/spot-select';
import type { SpotWithRelations } from '@/features/spots/spots-mappers';
import type { Spot, SpotEdits, SpotSubmission } from '@/features/spots/types';

/** The signed-in athlete's id, or `null` for a guest. */
async function currentUserId(): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user?.id ?? null;
}

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
  const { error: clearError } = await supabase.from('spot_equipment').delete().eq('spot_id', spotId);

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

/** Every spot, newest submission first, for the discovery list. */
export async function getSpots(): Promise<Spot[]> {
  const { data, error } = await supabase
    .from('spots')
    .select(SPOT_SELECT)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => toSpot(row as SpotWithRelations));
}

/**
 * One spot with its reviews joined, or `null` when there is no such row.
 *
 * `null` and an error are different answers: a removed or never-existing spot is not a failure,
 * and the screen shows the same "not found" for both a wrong id and a spot moderation closed.
 */
export async function getSpotById(spotId: string): Promise<Spot | null> {
  const { data, error } = await supabase
    .from('spots')
    .select(
      `
      *,
      spot_equipment (
        condition,
        quantity,
        equipment ( id, name )
      ),
      photos ( id, storage_path, created_at ),
      reviews (
        id,
        rating,
        comment,
        created_at,
        updated_at,
        spot_id,
        user_id,
        profiles ( username )
      )
    `,
    )
    .eq('id', spotId)
    .maybeSingle();

  if (error) throw error;

  return data === null ? null : toSpot(data as SpotWithRelations);
}

/**
 * Records a submission as waiting for review and returns the stored spot.
 *
 * The owner is the signed-in account rather than a passed-in id: a client that could name its own
 * owner would let anyone file a spot under somebody else's name, so the id comes from the
 * session the RLS policy already checks.
 */
export async function createSpot(submission: SpotSubmission): Promise<Spot> {
  const ownerId = await currentUserId();

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
 * The coordinate is not editable and is not written.
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

  const spot = await getSpotById(spotId);

  if (spot === null) throw new Error('The spot was saved but could not be read back.');

  return spot;
}

export type ReportSpotInput = {
  spotId: string;
  reason: string;
  /** What is wrong with the spot, when the reason alone does not say it. */
  description?: string;
};

/**
 * Files a report against a spot.
 *
 * The reporter is the session, never a field on the input, so a report cannot be filed under
 * somebody else's account. RLS rejects the write for a guest; the check here turns that into a
 * message the screen can show instead of a raw policy error.
 */
export async function reportSpot({ spotId, reason, description }: ReportSpotInput): Promise<void> {
  const reporterId = await currentUserId();

  if (reporterId === null) {
    throw new Error('Sign in to report a spot.');
  }

  const { error } = await supabase.from('reports').insert({
    spot_id: spotId,
    user_id: reporterId,
    reason: reason.trim(),
    description: description?.trim() ?? null,
  });

  if (error) throw error;
}
