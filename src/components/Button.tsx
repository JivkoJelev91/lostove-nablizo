import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import type { ReactNode } from 'react';

import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { brandColors } from '@/constants/design-tokens';
import { cn } from '@/utils/cn';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

export type ButtonProps = {
  /** Visible button text. Also used as the default accessibility label. */
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Blocks interaction and renders the disabled treatment. */
  disabled?: boolean;
  /** Swaps the leading icon for a spinner and blocks interaction. */
  loading?: boolean;
  /** Stretches the button to the width of its container. */
  fullWidth?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  className?: string;
  testID?: string;
};

/**
 * Every variant carries a `shadow-*`, an `opacity-*` and an `active:*` class, including the
 * no-op `shadow-none`/`opacity-100`, and the disabled treatment matches those categories.
 *
 * This is deliberate: NativeWind's native runtime swaps a Pressable's underlying component when
 * its class set gains or loses one of those utilities after the first render, and the remount
 * surfaces as a spurious "Couldn't find a navigation context" crash. Keeping the categories
 * present from the first render avoids the swap. See nativewind/nativewind#1466.
 */
const VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-primary opacity-100 active:bg-primary-pressed shadow-button',
  secondary: 'border border-primary bg-transparent opacity-100 active:bg-bg-surface shadow-none',
  ghost: 'bg-transparent opacity-100 active:bg-bg-surface shadow-none',
  danger: 'bg-status-bad opacity-100 active:opacity-80 shadow-button',
};

const VARIANT_TEXT_CLASS: Record<ButtonVariant, string> = {
  primary: 'text-text-on-primary',
  secondary: 'text-primary',
  ghost: 'text-primary',
  danger: 'text-text-on-secondary',
};

const VARIANT_SPINNER_COLOR: Record<ButtonVariant, string> = {
  primary: brandColors.onPrimary,
  secondary: brandColors.primary,
  ghost: brandColors.primary,
  danger: brandColors.onSecondary,
};

const SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-control-sm px-space-12',
  md: 'h-control px-space-16',
};

/**
 * The button primitive every named button wraps.
 *
 * It owns the shared shape, spacing, disabled/loading behaviour and a 97% press dip; the
 * variant decides the colour treatment. The dip lives on a Reanimated wrapper rather than on a
 * class so the Pressable's class set stays stable, which is what the comment above protects.
 * Prefer {@link PrimaryButton} and friends at call sites so the intent reads from the name —
 * reach for `Button` only when the variant is genuinely dynamic.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  accessibilityLabel,
  accessibilityHint,
  className,
  testID,
}: ButtonProps) {
  const inactive = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const pressIn = () => {
    if (!inactive) {
      scale.set(withTiming(0.97, { duration: 90, reduceMotion: ReduceMotion.System }));
    }
  };

  const pressOut = () => {
    scale.set(withTiming(1, { duration: 140, reduceMotion: ReduceMotion.System }));
  };

  // The classes live on a plain view and the animated style on the view inside it. An animated
  // component never carries `className`: Reanimated's own props replace it, so the classes are
  // dropped on a device while react-native-web still applies them. See AGENTS.md.
  return (
    <View className={cn('rounded-pill', fullWidth && 'w-full', className)}>
      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel ?? label}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ disabled: inactive, busy: loading }}
          className={cn(
            'flex-row items-center justify-center gap-space-8 rounded-pill',
            SIZE_CLASS[size],
            inactive
              ? 'border border-border bg-bg-surface opacity-60 shadow-none active:bg-bg-surface'
              : VARIANT_CLASS[variant],
            fullWidth && 'w-full',
          )}
          disabled={inactive}
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          testID={testID}
        >
          {loading ? (
            <ActivityIndicator color={VARIANT_SPINNER_COLOR[variant]} size="small" />
          ) : leftIcon ? (
            <View accessible={false}>{leftIcon}</View>
          ) : null}

          <Text
            className={cn(
              'font-semibold text-body',
              inactive ? 'text-text-muted' : VARIANT_TEXT_CLASS[variant],
            )}
            numberOfLines={1}
          >
            {label}
          </Text>

          {!loading && rightIcon ? <View accessible={false}>{rightIcon}</View> : null}
        </Pressable>
      </Animated.View>
    </View>
  );
}

export function PrimaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="primary" />;
}

export function SecondaryButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="secondary" />;
}

export function GhostButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="ghost" />;
}

export function DangerButton(props: Omit<ButtonProps, 'variant'>) {
  return <Button {...props} variant="danger" />;
}
