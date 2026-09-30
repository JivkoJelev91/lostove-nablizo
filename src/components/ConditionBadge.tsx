import { Text, View } from 'react-native';

import type { EquipmentCondition } from '@/components/EquipmentList';
import { cn } from '@/utils/cn';

export type ConditionBadgeProps = {
  condition: EquipmentCondition;
  className?: string;
};

const DOT_CLASS: Record<EquipmentCondition, string> = {
  good: 'bg-status-good',
  worn: 'bg-status-warning',
  damaged: 'bg-status-bad',
};

const TEXT_CLASS: Record<EquipmentCondition, string> = {
  good: 'text-status-good',
  worn: 'text-status-warning',
  damaged: 'text-status-bad',
};

const LABEL: Record<EquipmentCondition, string> = {
  good: 'Good',
  worn: 'Worn',
  damaged: 'Damaged',
};

/**
 * The condition of a spot's equipment as one pill: a colour-coded dot and the word itself.
 *
 * It is the readable counterpart to the dot an equipment tile carries, for the screens that
 * report the spot's overall state rather than each piece's.
 */
export function ConditionBadge({ condition, className }: ConditionBadgeProps) {
  return (
    <View
      accessibilityLabel={`Condition: ${LABEL[condition]}`}
      accessibilityRole="text"
      className={cn(
        'flex-row items-center gap-space-8 self-start rounded-pill bg-bg-surface px-space-12 py-space-8',
        className,
      )}
    >
      <View accessible={false} className={cn('h-2 w-2 rounded-pill', DOT_CLASS[condition])} />

      <Text className={cn('font-medium text-bodySmall', TEXT_CLASS[condition])} numberOfLines={1}>
        {LABEL[condition]}
      </Text>
    </View>
  );
}
