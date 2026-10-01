import { useEffect } from 'react';
import { View } from 'react-native';

import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { brandColors, spacingValues, statusColors } from '@/constants/design-tokens';
import { cn } from '@/utils/cn';

const PIECE_COUNT = 18;

const PIECE_COLORS = [
  brandColors.primary,
  statusColors.good,
  statusColors.warning,
  statusColors.bad,
];

const PIECE_SIZE = { width: spacingValues[12], height: spacingValues[24] };

/**
 * The burst starts low on the screen, where the confirmation buttons are, and shoots upward.
 *
 * Position, size and colour are plain styles rather than classes on purpose. Reanimated replaces
 * the props of its own components, so a class on an animated view is silently dropped on a device
 * and the pieces collapse to nothing — which is exactly how a celebration ends up invisible. The
 * pieces must also carry `position: absolute` themselves: without it they stack in flow and the
 * burst starts from the top of the screen instead of the bottom.
 */
const PIECE_POSITION = { position: 'absolute', left: '50%', bottom: '24%' } as const;

/** How long a piece takes to cross the screen, and how long after its predecessor it starts. */
const RISE_DURATION = 1200;
const RISE_DELAY = 26;

type ConfettiPieceProps = {
  index: number;
};

/**
 * One piece: it shoots up from the bottom, drifts sideways and spins, then fades near the end
 * of the run.
 *
 * The travel is derived from the index rather than random, so the burst is the same lively
 * shape on every device and does not recompute on a re-render.
 */
function ConfettiPiece({ index }: ConfettiPieceProps) {
  const progress = useSharedValue(0);
  const drift = ((index % 6) - 2.5) * 26;
  const rise = 190 + ((index * 37) % 130);

  useEffect(() => {
    progress.value = withDelay(
      index * RISE_DELAY,
      withTiming(1, {
        duration: RISE_DURATION,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.System,
      }),
    );
  }, [index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity:
      progress.value < 0.72
        ? Math.min(1, progress.value / 0.12)
        : Math.max(0, 1 - (progress.value - 0.72) / 0.28),
    transform: [
      { translateX: progress.value * drift },
      { translateY: -progress.value * rise },
      { rotate: `${progress.value * 420 + (index % 3) * 60}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[
        PIECE_POSITION,
        PIECE_SIZE,
        { backgroundColor: PIECE_COLORS[index % PIECE_COLORS.length] },
        animatedStyle,
      ]}
    />
  );
}

export type ConfettiProps = {
  className?: string;
};

/**
 * A short, single burst of confetti for the spot-submitted screen.
 *
 * It launches from the lower part of the screen, where the confirmation buttons sit, so the
 * celebration belongs to the action that was just taken. It overlays the screen without
 * blocking it and never loops, so render it after the content it should sit over. Reanimated's
 * reduced-motion handling empties the travel when the system asks for less movement.
 */
export function Confetti({ className }: ConfettiProps) {
  return (
    <View
      accessible={false}
      className={cn('absolute inset-0 items-center overflow-hidden', className)}
      pointerEvents="none"
    >
      {Array.from({ length: PIECE_COUNT }, (_, index) => (
        <ConfettiPiece index={index} key={index} />
      ))}
    </View>
  );
}
