import { Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type ChipProps = {
  label: string;
  leftIcon?: ReactNode;
  className?: string;
};

/** A non-interactive tag. Use {@link FilterChip} when the tag can be selected. */
export function Chip({ label, leftIcon, className }: ChipProps) {
  return (
    <View
      className={cn(
        'h-chip-control flex-row items-center gap-space-4 rounded-pill bg-bg-surface px-space-12',
        className,
      )}
    >
      {leftIcon !== undefined ? <View accessible={false}>{leftIcon}</View> : null}
      <Text className="font-medium text-caption text-text-primary">{label}</Text>
    </View>
  );
}

export type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  leftIcon?: ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
};

/**
 * A selectable filter. The active state is the only thing that differs from {@link Chip}:
 * a lime outline and a soft glow, so selection reads as emphasis rather than as a filled
 * button competing with the screen's primary action.
 */
export function FilterChip({
  label,
  selected = false,
  onPress,
  leftIcon,
  disabled = false,
  accessibilityLabel,
  className,
}: FilterChipProps) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      className={cn(
        'h-chip-control flex-row items-center gap-space-4 rounded-pill border bg-bg-surface px-space-12',
        // Both branches keep a shadow and an active class, for the NativeWind remount reason
        // spelled out in `Button`.
        selected
          ? 'border-primary shadow-glow active:bg-bg-surface'
          : 'border-border shadow-none active:bg-bg-main',
        disabled && 'opacity-50',
        className,
      )}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
    >
      {leftIcon !== undefined ? <View accessible={false}>{leftIcon}</View> : null}
      <Text
        className={cn('font-medium text-caption', selected ? 'text-primary' : 'text-text-primary')}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export type EquipmentChipProps = {
  label: string;
  /** Rendered as `×N` after the label. Omitted when the quantity is unknown. */
  quantity?: number;
  icon?: ReactNode;
  selected?: boolean;
  onPress?: () => void;
  disabled?: boolean;
  accessibilityLabel?: string;
  className?: string;
};

/** An equipment tag that carries a quantity, e.g. `Pull-up ×2`. */
export function EquipmentChip({
  label,
  quantity,
  icon,
  selected = false,
  onPress,
  disabled = false,
  accessibilityLabel,
  className,
}: EquipmentChipProps) {
  const containerClass = cn(
    'h-chip-control flex-row items-center gap-space-8 rounded-pill border bg-bg-surface px-space-12',
    selected ? 'border-primary' : 'border-border',
    disabled && 'opacity-50',
    className,
  );

  const content = (
    <>
      {icon !== undefined ? <View accessible={false}>{icon}</View> : null}
      <Text className="font-medium text-bodySmall text-text-primary">{label}</Text>
      {quantity !== undefined ? (
        <Text className="font-semibold text-bodySmall text-primary">{`×${quantity}`}</Text>
      ) : null}
    </>
  );

  if (onPress === undefined) {
    return <View className={containerClass}>{content}</View>;
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ selected, disabled }}
      className={cn(containerClass, 'active:bg-bg-main')}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
    >
      {content}
    </Pressable>
  );
}

export type StatusTone = 'good' | 'warning' | 'bad' | 'neutral';

export type StatusChipProps = {
  label: string;
  tone?: StatusTone;
  icon?: ReactNode;
  className?: string;
};

const STATUS_CONTAINER_CLASS: Record<StatusTone, string> = {
  good: 'bg-status-good-soft',
  warning: 'bg-status-warning-soft',
  bad: 'bg-status-bad-soft',
  neutral: 'bg-bg-surface',
};

const STATUS_TEXT_CLASS: Record<StatusTone, string> = {
  good: 'text-status-good',
  warning: 'text-status-warning',
  bad: 'text-status-bad',
  neutral: 'text-text-secondary',
};

/** A small uppercase badge for a verification, condition or moderation state. */
export function StatusChip({ label, tone = 'neutral', icon, className }: StatusChipProps) {
  return (
    <View
      className={cn(
        'flex-row items-center gap-space-4 self-start rounded-pill px-space-8 py-space-4',
        STATUS_CONTAINER_CLASS[tone],
        className,
      )}
    >
      {icon !== undefined ? <View accessible={false}>{icon}</View> : null}
      <Text
        className={cn('font-semibold text-caption uppercase', STATUS_TEXT_CLASS[tone])}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}
