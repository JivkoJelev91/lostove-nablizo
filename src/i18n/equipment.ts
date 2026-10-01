import { t } from '@/i18n';

/**
 * The Bulgarian word for each kind of equipment, keyed by the English name the data stores.
 *
 * Equipment names are identifiers everywhere else — in the draft, in the database and in the
 * filter matching — so translation happens only where a name is shown to a person. An unknown
 * name falls through unchanged, which is what lets an imported or newly added piece of
 * equipment appear before this map learns about it.
 */
const EQUIPMENT_LABELS: Record<string, string> = {
  'Pull-up': t('equipment.pullUp'),
  Dips: t('equipment.dips'),
  Rings: t('equipment.rings'),
  'Monkey bars': t('equipment.monkeyBars'),
  Ladder: t('equipment.ladder'),
  'Sit-up bench': t('equipment.sitUpBench'),
  'Push-up bars': t('equipment.pushUpBars'),
};

export function equipmentLabel(name: string): string {
  return EQUIPMENT_LABELS[name] ?? name;
}
