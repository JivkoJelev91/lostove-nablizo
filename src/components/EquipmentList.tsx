import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { t } from '@/i18n';
import { equipmentLabel } from '@/i18n/equipment';
import { cn } from '@/utils/cn';

/** How usable a piece of equipment is, shown as a colour-coded dot on its tile. */
export type EquipmentCondition = 'good' | 'worn' | 'damaged';

const CONDITION_DOT_CLASS: Record<EquipmentCondition, string> = {
  good: 'bg-status-good',
  worn: 'bg-status-warning',
  damaged: 'bg-status-bad',
};

const CONDITION_LABEL: Record<EquipmentCondition, string> = {
  good: t('condition.goodLong'),
  worn: t('condition.wornLong'),
  damaged: t('condition.damagedLong'),
};

export type EquipmentItemProps = {
  name: string;
  /** Rendered as `×2` under the name. Omitted when the quantity is unknown. */
  quantity?: number;
  condition?: EquipmentCondition;
  icon?: ReactNode;
  accessibilityLabel?: string;
  onPress?: () => void;
  className?: string;
};

/**
 * One piece of equipment as an 80pt tile: what it is, how many, and how it is holding up.
 *
 * Condition is a dot rather than a word because the tile has one line to spare after the icon,
 * name and quantity. The colour carries the state and the accessibility label spells it out.
 */
export function EquipmentItem({
  name,
  quantity,
  condition,
  icon,
  accessibilityLabel,
  onPress,
  className,
}: EquipmentItemProps) {
  const containerClass = cn(
    'h-equipment-tile w-equipment-tile items-center justify-center gap-space-2 rounded-md bg-bg-surface p-space-8',
    onPress !== undefined && 'active:opacity-90',
    className,
  );

  const content = (
    <>
      {icon !== undefined ? <View accessible={false}>{icon}</View> : null}

      <Text className="font-semibold text-bodySmall text-text-primary" numberOfLines={1}>
        {equipmentLabel(name)}
      </Text>

      {quantity !== undefined ? (
        <Text className="text-caption text-text-secondary">{`×${quantity}`}</Text>
      ) : null}
    </>
  );

  const dot =
    condition !== undefined ? (
      <View
        accessible={false}
        className={cn(
          'absolute right-space-4 top-space-4 h-2 w-2 rounded-pill',
          CONDITION_DOT_CLASS[condition],
        )}
      />
    ) : null;

  if (onPress === undefined) {
    return (
      <View className={containerClass}>
        {content}
        {dot}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={
        accessibilityLabel ??
        [
          equipmentLabel(name),
          quantity === undefined ? undefined : t('equipment.quantity', { count: quantity }),
          condition === undefined ? undefined : CONDITION_LABEL[condition],
        ]
          .filter((part) => part !== undefined)
          .join(', ')
      }
      accessibilityRole="button"
      className={containerClass}
      onPress={onPress}
    >
      {content}
      {dot}
    </Pressable>
  );
}

export type EquipmentListItem = {
  name: string;
  quantity?: number;
  condition?: EquipmentCondition;
  icon?: ReactNode;
};

export type EquipmentListProps = {
  items: readonly EquipmentListItem[];
  /** Called with the item's index, so the caller knows which piece was tapped. */
  onPressItem?: (index: number) => void;
  className?: string;
};

/**
 * Equipment tiles in a wrapping row, in the order the caller lists them.
 *
 * The order is the caller's because it carries meaning: the piece a spot is known for comes
 * first, so this never re-sorts or groups on its own.
 */
export function EquipmentList({ items, onPressItem, className }: EquipmentListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <View className={cn('flex-row flex-wrap gap-space-8', className)}>
      {items.map((item, index) => (
        <EquipmentItem
          condition={item.condition}
          icon={item.icon}
          key={`${item.name}-${index}`}
          name={item.name}
          onPress={onPressItem === undefined ? undefined : () => onPressItem(index)}
          quantity={item.quantity}
        />
      ))}
    </View>
  );
}
