import { ActivityIndicator, Pressable, View } from 'react-native';
import type { ReactNode } from 'react';

import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { brandColors, statusColors } from '@/constants/design-tokens';
import { cn } from '@/utils/cn';

export type IconButtonVariant = 'primary' | 'surface' | 'ghost' | 'danger';
export type IconButtonSize = 'sm' | 'md' | 'lg';

export type IconButtonProps = {
  /** The icon to render. Its colour is the caller's concern — pass a design token value. */
  icon: ReactNode;
  /** Required: an icon has no visible text to describe it. */
  accessibilityLabel: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  testID?: string;
};

/** Kept class-stable like `Button`, for the NativeWind remount reason documented there. */
const VARIANT_CLASS: Record<IconButtonVariant, string> = {
  primary: 'bg-primary opacity-100 active:bg-primary-pressed',
  surface: 'bg-bg-surface opacity-100 active:bg-bg-main',
  ghost: 'bg-transparent opacity-100 active:bg-bg-surface',
  danger: 'bg-transparent opacity-100 active:bg-status-bad-soft',
};

const VARIANT_SPINNER_COLOR: Record<IconButtonVariant, string> = {
  primary: brandColors.onPrimary,
  surface: brandColors.primary,
  ghost: brandColors.primary,
  danger: statusColors.bad,
};

const SIZE_CLASS: Record<IconButtonSize, string> = {
  sm: 'h-icon-lg w-icon-lg',
  md: 'h-icon-xl w-icon-xl',
  lg: 'h-control w-control',
};

/**
 * A square, icon-only button. The accessibility label is mandatory because there is no text
 * for a screen reader to announce; the icon itself is hidden from assistive technology.
 *
 * Like {@link Button}, the press dip lives on a Reanimated wrapper so the Pressable's class set
 * never changes between renders.
 */
export function IconButton({
  icon,
  accessibilityLabel,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  className,
  testID,
}: IconButtonProps) {
  const inactive = disabled || loading;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const pressIn = () => {
    if (!inactive) {
      scale.set(withTiming(0.92, { duration: 90, reduceMotion: ReduceMotion.System }));
    }
  };

  const pressOut = () => {
    scale.set(withTiming(1, { duration: 140, reduceMotion: ReduceMotion.System }));
  };

  // Classes on a plain view, the press scale on the animated one: an animated component never
  // carries `className`, because Reanimated's props replace it on a device. See AGENTS.md.
  return (
    <View className={cn('rounded-pill', className)}>
      <Animated.View style={animatedStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityState={{ disabled: inactive, busy: loading }}
          className={cn(
            'items-center justify-center rounded-pill',
            SIZE_CLASS[size],
            inactive ? 'opacity-50 active:bg-bg-surface' : VARIANT_CLASS[variant],
          )}
          disabled={inactive}
          onPress={onPress}
          onPressIn={pressIn}
          onPressOut={pressOut}
          testID={testID}
        >
          {loading ? (
            <ActivityIndicator color={VARIANT_SPINNER_COLOR[variant]} size="small" />
          ) : (
            <View accessible={false}>{icon}</View>
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}
