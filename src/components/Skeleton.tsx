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

  // The pulse goes on an animated view that only carries a style; the caller's size and radius
  // stay on the plain view around it, because an animated component never takes `className`.
  return (
    <View
      accessibilityElementsHidden
      className={cn('h-space-16 w-full rounded-md bg-bg-surface', className)}
      importantForAccessibility="no-hide-descendants"
    >
      <Animated.View style={[animatedStyle, { flex: 1 }]} />
    </View>
  );
}
