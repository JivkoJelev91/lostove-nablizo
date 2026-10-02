import { supabase } from '@/lib/supabase';
import type { TablesInsert } from '@/lib/supabase';
import type { Spot, SpotEdits, SpotSubmission } from '@/features/spots/types';
import type { SpotEquipment } from '@/components';

import { mapEquipmentTypeToName, mapSpotRowToSpot } from './spots-mappers';

type SpotWithRelations = Parameters<typeof mapSpotRowToSpot>[0];

async function getEquipmentIdByType(type: SpotEquipment): Promise<string | null> {
  const name = mapEquipmentTypeToName(type);
  const { data, error } = await supabase
    .from('equipment')
    .select('id, name')
    .ilike('name', name)
    .maybeSingle();
  if (error || !data) return null;
  return data.id;
}

export async function getSpots(): Promise<Spot[]> {
  const { data, error } = await supabase
    .from('spots')
    .select(
      `
      *,
      spot_equipment (
        *,
        equipment (*)
      ),
      photos (*)
    `,
    )
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapSpotRowToSpot(row as SpotWithRelations));
}

export async function getSpotById(spotId: string): Promise<Spot | null> {
  const { data, error } = await supabase
    .from('spots')
    .select(
      `
      *,
      spot_equipment (
        *,
        equipment (*)
      ),
      photos (*)
    `,
    )
    .eq('id', spotId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) return null;

  return mapSpotRowToSpot(data as SpotWithRelations);
}

export async function createSpot(submission: SpotSubmission): Promise<Spot> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const ownerId = user?.id ?? null;

  const insert: TablesInsert<'spots'> = {
    name: submission.name.trim(),
    description: submission.description.trim(),
    latitude: submission.coordinate.latitude,
    longitude: submission.coordinate.longitude,
    status: 'under_review',
    source: 'manual',
    rating_average: 0,
    rating_count: 0,
    ...(ownerId ? { created_by: ownerId } : {}),
  };

  const { data: createdSpot, error: createError } = await supabase
    .from('spots')
    .insert(insert)
    .select()
    .single();

  if (createError || !createdSpot) {
    throw createError ?? new Error('Failed to create spot');
  }

  const spotId = createdSpot.id;

  if (submission.equipment.length > 0) {
    const equipmentInserts: TablesInsert<'spot_equipment'>[] = [];
    for (const type of submission.equipment) {
      const equipmentId = await getEquipmentIdByType(type);
      if (equipmentId) {
        equipmentInserts.push({
          spot_id: spotId,
          equipment_id: equipmentId,
          condition: 'good',
          quantity: 1,
        });
      }
    }
    if (equipmentInserts.length > 0) {
      const { error: eqError } = await supabase.from('spot_equipment').insert(equipmentInserts);
      if (eqError) {
        console.warn('Failed to insert spot equipment:', eqError);
      }
    }
  }

  const created = await getSpotById(spotId);
  if (!created) {
    throw new Error('Spot created but not found');
  }
  return created;
}

export async function updateSpot(spotId: string, edits: SpotEdits): Promise<Spot> {
  const { error: updateError } = await supabase
    .from('spots')
    .update({
      name: edits.name.trim(),
      description: edits.description.trim(),
      status: 'under_review',
      updated_at: new Date().toISOString(),
    })
    .eq('id', spotId);

  if (updateError) {
    throw updateError;
  }

  const { error: deleteEqError } = await supabase.from('spot_equipment').delete().eq('spot_id', spotId);
  if (deleteEqError) {
    console.warn('Failed to clear spot equipment:', deleteEqError);
  }

  if (edits.equipment.length > 0) {
    const equipmentInserts: TablesInsert<'spot_equipment'>[] = [];
    for (const type of edits.equipment) {
      const equipmentId = await getEquipmentIdByType(type);
      if (equipmentId) {
        equipmentInserts.push({
          spot_id: spotId,
          equipment_id: equipmentId,
          condition: edits.condition,
          quantity: 1,
        });
      }
    }
    if (equipmentInserts.length > 0) {
      const { error: eqError } = await supabase.from('spot_equipment').insert(equipmentInserts);
      if (eqError) {
        console.warn('Failed to update spot equipment:', eqError);
      }
    }
  }

  const updated = await getSpotById(spotId);
  if (!updated) {
    throw new Error('Spot updated but not found');
  }
  return updated;
}

export type ReportSpotInput = {
  spotId: string;
  reason: string;
  description?: string | null;
};

export async function reportSpot({ spotId, reason, description }: ReportSpotInput): Promise<void> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User must be authenticated to report a spot');
  }

  const insert: TablesInsert<'reports'> = {
    spot_id: spotId,
    user_id: user.id,
    reason: reason.trim(),
    description: description?.trim() || null,
    status: 'pending',
  };

  const { error } = await supabase.from('reports').insert(insert);
  if (error) {
    throw error;
  }
}
