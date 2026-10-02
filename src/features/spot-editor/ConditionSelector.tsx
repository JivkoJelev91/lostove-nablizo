import { Pressable, Text, View } from 'react-native';

import type { EquipmentCondition } from '@/components';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type ConditionSelectorProps = {
  value: EquipmentCondition;
  onChange: (condition: EquipmentCondition) => void;
  className?: string;
};

const CONDITION_ORDER: readonly EquipmentCondition[] = ['good', 'worn', 'damaged'];

const CONDITION_LABEL: Record<EquipmentCondition, string> = {
  good: t('condition.good'),
  worn: t('condition.worn'),
  damaged: t('condition.damaged'),
};

const SELECTED_CONTAINER_CLASS: Record<EquipmentCondition, string> = {
  good: 'border-status-good bg-status-good-soft',
  worn: 'border-status-warning bg-status-warning-soft',
  damaged: 'border-status-bad bg-status-bad-soft',
};

const SELECTED_TEXT_CLASS: Record<EquipmentCondition, string> = {
  good: 'text-status-good',
  worn: 'text-status-warning',
  damaged: 'text-status-bad',
};

const DOT_CLASS: Record<EquipmentCondition, string> = {
  good: 'bg-status-good',
  worn: 'bg-status-warning',
  damaged: 'bg-status-bad',
};

/** The condition picker: the three states as radio cards, the selection tinted like its badge. */
export function ConditionSelector({ value, onChange, className }: ConditionSelectorProps) {
  return (
    <View accessibilityRole="radiogroup" className={cn('flex-row gap-space-8', className)}>
      {CONDITION_ORDER.map((condition) => {
        const selected = condition === value;

        return (
          <Pressable
            accessibilityLabel={CONDITION_LABEL[condition]}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className={cn(
              'flex-1 flex-row items-center justify-center gap-space-8 rounded-lg border p-space-12',
              selected
                ? SELECTED_CONTAINER_CLASS[condition]
                : 'border-border bg-bg-surface active:bg-bg-main',
            )}
            key={condition}
            onPress={() => onChange(condition)}
          >
            <View className={cn('h-space-8 w-space-8 rounded-pill', DOT_CLASS[condition])} />

            <Text
              className={cn(
                'font-semibold text-bodySmall',
                selected ? SELECTED_TEXT_CLASS[condition] : 'text-text-secondary',
              )}
              numberOfLines={1}
            >
              {CONDITION_LABEL[condition]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
