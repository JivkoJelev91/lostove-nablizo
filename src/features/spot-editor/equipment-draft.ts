import type { Spot } from '@/features/spots/types';
import { isEquipmentName } from '@/features/spots/equipment-icons';
import type { EquipmentName } from '@/features/spots/equipment-icons';
import type { EquipmentDraftItem } from '@/features/spot-editor/types';

/** The most of one piece of equipment a draft can claim. */
export const MAX_EQUIPMENT_QUANTITY = 10;

/**
 * The equipment a new spot can be tagged with, in the order the picker shows it.
 *
 * This is the full vocabulary, not the discovery filter's shorter list: an editor should be
 * able to describe any spot, even one whose equipment the home screen does not filter by.
 */
export const EQUIPMENT_CATALOGUE: readonly EquipmentName[] = [
  'Pull-up',
  'Dips',
  'Rings',
  'Monkey bars',
  'Ladder',
];

/** Adds a piece at one, or removes it when it was already picked. */
export function toggleEquipment(
  items: readonly EquipmentDraftItem[],
  name: EquipmentName,
): EquipmentDraftItem[] {
  if (items.some((item) => item.name === name)) {
    return items.filter((item) => item.name !== name);
  }

  return [...items, { name, quantity: 1 }];
}

/** Moves one piece's quantity by `delta`, clamped to one and {@link MAX_EQUIPMENT_QUANTITY}. */
export function changeEquipmentQuantity(
  items: readonly EquipmentDraftItem[],
  name: EquipmentName,
  delta: number,
): EquipmentDraftItem[] {
  return items.map((item) => {
    if (item.name !== name) {
      return item;
    }

    const quantity = Math.min(MAX_EQUIPMENT_QUANTITY, Math.max(1, item.quantity + delta));

    return { name: item.name, quantity };
  });
}

/** Seeds an edit draft from the spot's stored equipment, defaulting unknown quantities to one. */
export function equipmentDraftFromSpot(spot: Spot): EquipmentDraftItem[] {
  return spot.equipment.flatMap((item) =>
    isEquipmentName(item.name) ? [{ name: item.name, quantity: item.quantity ?? 1 }] : [],
  );
}

/** True when two equipment lists hold the same picks with the same quantities. */
export function equipmentDraftsEqual(
  first: readonly EquipmentDraftItem[],
  second: readonly EquipmentDraftItem[],
): boolean {
  if (first.length !== second.length) {
    return false;
  }

  return first.every((item, index) => {
    const other = second[index];

    return other !== undefined && other.name === item.name && other.quantity === item.quantity;
  });
}

/** Writes the equipment list the way the review step shows it, e.g. `Pull-up ×2 · Dips ×1`. */
export function formatEquipmentSummary(items: readonly EquipmentDraftItem[]): string {
  return items.map((item) => `${item.name} ×${item.quantity}`).join(' · ');
}
