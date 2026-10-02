import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/utils/cn';

export type SkeletonProps = {
  /** Sizing and radius come from classes, e.g. `h-control w-3/4 rounded-lg`. */
  className?: string;
};

const PULSE_DURATION = 800;
const DIM_OPACITY = 0.4;

/** A pulsing placeholder block. Size it with `className` to match the content it stands in for. */
export function Skeleton({ className }: SkeletonProps) {
  const opacity = useSharedValue(DIM_OPACITY);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: PULSE_DURATION }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  // The pulse lives on an animated wrapper that carries only its style, and the size, radius and
  // background stay on the plain view inside it, because an animated component never takes
  // `className`. The empty animated view this used to be pulsed nothing: the visible block was
  // its sibling, so the skeleton sat still.
  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={animatedStyle}
    >
      <View className={cn('h-space-16 w-full rounded-md bg-bg-surface', className)} />
    </Animated.View>
  );
}
