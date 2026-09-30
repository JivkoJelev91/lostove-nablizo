import { Pressable, View } from 'react-native';
import type { ReactNode } from 'react';

import { cn } from '@/utils/cn';

export type CardVariant = 'flat' | 'elevated' | 'outlined';
export type CardPadding = 'none' | 'sm' | 'md';
export type CardGap = 'none' | 'sm' | 'md' | 'lg';

export type CardProps = {
  children: ReactNode;
  /** `flat` sits on the surface colour, `elevated` adds depth, `outlined` is border-only. */
  variant?: CardVariant;
  padding?: CardPadding;
  /** Space between direct children. Use `none` for cards that manage their own layout. */
  gap?: CardGap;
  /** When provided the card becomes pressable and announces itself as a button. */
  onPress?: () => void;
  accessibilityLabel?: string;
  className?: string;
  testID?: string;
};

const OUTER_VARIANT_CLASS: Record<CardVariant, string> = {
  flat: '',
  elevated: 'shadow-card-elevated',
  outlined: '',
};

const INNER_VARIANT_CLASS: Record<CardVariant, string> = {
  flat: 'border border-border bg-surface-card',
  elevated: 'bg-surface-card-elevated',
  outlined: 'border border-border bg-transparent',
};

const PADDING_CLASS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-space-12',
  md: 'p-card-pad',
};

const GAP_CLASS: Record<CardGap, string> = {
  none: '',
  sm: 'gap-space-4',
  md: 'gap-card-gap',
  lg: 'gap-card-gap-lg',
};

/**
 * A rounded content container with a predictable internal gap between its children.
 *
 * The gap is the card's contract: pass sections as direct children and they space themselves.
 * A card whose contents need different spacing should set `gap="none"` and lay out its own
 * children instead of overriding the gap at the call site.
 *
 * The surface is two layers on purpose: the shadow lives on the outer layer and the clipping
 * on the inner one. A single layer with `overflow-hidden` would clip its own shadow.
 */
export function Card({
  children,
  variant = 'flat',
  padding = 'md',
  gap = 'md',
  onPress,
  accessibilityLabel,
  className,
  testID,
}: CardProps) {
  const innerClass = cn(
    'overflow-hidden rounded-lg',
    GAP_CLASS[gap],
    INNER_VARIANT_CLASS[variant],
    PADDING_CLASS[padding],
  );
  const outerClass = cn('rounded-lg', OUTER_VARIANT_CLASS[variant], className);

  const surface = <View className={innerClass}>{children}</View>;

  if (onPress === undefined) {
    return (
      <View className={outerClass} testID={testID}>
        {surface}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      className={cn(outerClass, 'active:opacity-90')}
      onPress={onPress}
      testID={testID}
    >
      {surface}
    </Pressable>
  );
}
