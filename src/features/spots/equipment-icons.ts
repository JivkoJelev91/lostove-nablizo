import type { ComponentType } from 'react';

import { DipBarsIcon, LadderIcon, MonkeyBarsIcon, PullUpBarIcon, RingsIcon } from '@/components';
import type { EquipmentIconProps } from '@/components';

/** Every equipment name the app knows, so the icon map cannot miss one. */
export type EquipmentName = 'Pull-up' | 'Dips' | 'Rings' | 'Monkey bars' | 'Ladder';

/** The line-art glyph each kind of equipment is drawn with, wherever it appears. */
export const EQUIPMENT_ICONS: Record<EquipmentName, ComponentType<EquipmentIconProps>> = {
  'Pull-up': PullUpBarIcon,
  Dips: DipBarsIcon,
  Rings: RingsIcon,
  'Monkey bars': MonkeyBarsIcon,
  Ladder: LadderIcon,
};

/** Narrows a free-form equipment name to one the icon map knows. */
export function isEquipmentName(name: string): name is EquipmentName {
  return name in EQUIPMENT_ICONS;
}
