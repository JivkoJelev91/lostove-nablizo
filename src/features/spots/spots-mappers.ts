import type { ImageSourcePropType } from 'react-native';

import { supabase } from '@/lib/supabase';
import type { Tables } from '@/lib/supabase';
import type { Coordinate, Spot } from '@/features/spots/types';
import type { EquipmentCondition, SpotEquipment } from '@/components';

type SpotRow = Tables<'spots'>;
type SpotEquipmentRow = Tables<'spot_equipment'>;
type PhotoRow = Tables<'photos'>;
type EquipmentRow = Tables<'equipment'>;

type SpotWithRelations = SpotRow & {
  spot_equipment?: (SpotEquipmentRow & {
    equipment?: EquipmentRow | null;
  })[];
  photos?: PhotoRow[];
};

const DEFAULT_COVER: ImageSourcePropType = require('@/assets/placeholder-spot.jpg');

export function mapCondition(condition: string | null | undefined): EquipmentCondition {
  const value = condition?.toLowerCase();
  if (value === 'excellent' || value === 'good' || value === 'fair' || value === 'poor') {
    return value as EquipmentCondition;
  }
  return 'good';
}

export function mapEquipmentNameToType(name: string | null | undefined): SpotEquipment | null {
  if (!name) return null;
  const normalized = name.toLowerCase().trim();
  switch (normalized) {
    case 'pull-up bar':
    case 'pull up bar':
    case 'pull-up-bar':
      return 'pull-up-bar' as unknown as SpotEquipment;
    case 'parallel bars':
    case 'parallel-bars':
    case 'dip bars':
      return 'parallel-bars' as unknown as SpotEquipment;
    case 'bench':
      return 'bench' as unknown as SpotEquipment;
    case 'barbell':
    case 'barbells':
      return 'barbell' as unknown as SpotEquipment;
    case 'dumbbells':
    case 'dumbbell':
      return 'dumbbells' as unknown as SpotEquipment;
    case 'kettlebell':
    case 'kettlebells':
      return 'kettlebell' as unknown as SpotEquipment;
    case 'rack':
    case 'power rack':
      return 'rack' as unknown as SpotEquipment;
    case 'cables':
    case 'cable machine':
      return 'cables' as unknown as SpotEquipment;
    case 'leg press':
      return 'leg-press' as unknown as SpotEquipment;
    case 'treadmill':
      return 'treadmill' as unknown as SpotEquipment;
    case 'bike':
    case 'exercise bike':
    case 'stationary bike':
      return 'bike' as unknown as SpotEquipment;
    case 'rower':
      return 'rower' as unknown as SpotEquipment;
    case 'jump rope':
      return 'jump-rope' as unknown as SpotEquipment;
    case 'medicine ball':
      return 'medicine-ball' as unknown as SpotEquipment;
    case 'squat rack':
      return 'squat-rack' as unknown as SpotEquipment;
    case 'smith machine':
      return 'smith-machine' as unknown as SpotEquipment;
    default:
      return null;
  }
}

export function mapEquipmentTypeToName(type: SpotEquipment): string {
  const t = type as unknown as string;
  switch (t) {
    case 'pull-up-bar':
      return 'Pull-up bar';
    case 'parallel-bars':
      return 'Parallel bars';
    case 'bench':
      return 'Bench';
    case 'barbell':
      return 'Barbell';
    case 'dumbbells':
      return 'Dumbbells';
    case 'kettlebell':
      return 'Kettlebell';
    case 'rack':
      return 'Rack';
    case 'cables':
      return 'Cables';
    case 'leg-press':
      return 'Leg press';
    case 'treadmill':
      return 'Treadmill';
    case 'bike':
      return 'Bike';
    case 'rower':
      return 'Rower';
    case 'jump-rope':
      return 'Jump rope';
    case 'medicine-ball':
      return 'Medicine ball';
    case 'squat-rack':
      return 'Squat rack';
    case 'smith-machine':
      return 'Smith machine';
    default:
      return 'Equipment';
  }
}

function getPublicPhotoUrl(storagePath: string): ImageSourcePropType {
  const { data } = supabase.storage.from('photos').getPublicUrl(storagePath);
  const url = data.publicUrl;
  if (!url) return DEFAULT_COVER;
  return { uri: url };
}

function mapPhotosToImages(photos: PhotoRow[] | undefined): readonly ImageSourcePropType[] {
  if (!photos || photos.length === 0) {
    return [DEFAULT_COVER];
  }
  const images: ImageSourcePropType[] = photos
    .slice()
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map((photo) => getPublicPhotoUrl(photo.storage_path));
  return images.length > 0 ? images : [DEFAULT_COVER];
}

function deriveOverallCondition(
  equipmentRows: (SpotEquipmentRow & { equipment?: EquipmentRow | null })[] | undefined,
): EquipmentCondition {
  if (!equipmentRows || equipmentRows.length === 0) return 'good';
  const conditions = equipmentRows.map((e) => mapCondition(e.condition));
  const hasPoor = conditions.some((c) => (c as string) === 'poor');
  const hasFair = conditions.some((c) => (c as string) === 'fair');
  const hasExcellent = conditions.some((c) => (c as string) === 'excellent');
  if (hasPoor) return 'poor' as EquipmentCondition;
  if (hasFair) return 'fair' as EquipmentCondition;
  if (hasExcellent) return 'excellent' as EquipmentCondition;
  return 'good';
}

export function mapSpotRowToSpot(row: SpotWithRelations): Spot {
  const equipment = (row.spot_equipment ?? [])
    .map((se) => mapEquipmentNameToType(se.equipment?.name ?? null))
    .filter((e): e is SpotEquipment => e !== null);

  const coordinate: Coordinate = {
    latitude: row.latitude,
    longitude: row.longitude,
  };

  const spot: Spot = {
    id: row.id,
    name: row.name,
    coordinate,
    rating: row.rating_average,
    reviewCount: row.rating_count,
    equipment,
    condition: deriveOverallCondition(row.spot_equipment),
    description: row.description ?? '',
    distanceKm: 0,
    images: mapPhotosToImages(row.photos),
    status: (row.status as Spot['status']) ?? 'approved',
  };

  if (row.created_by) {
    spot.ownerId = row.created_by;
  }

  return spot;
}
