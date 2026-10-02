import { useEffect } from 'react';

import { Ionicons } from '@expo/vector-icons';
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { IconButton } from '@/components/IconButton';
import type { IconButtonSize, IconButtonVariant } from '@/components/IconButton';
import { iconSizeValues, schemeTextSecondary, statusColors } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

export type FavoriteButtonProps = {
  isFavorite: boolean;
  onPress: () => void;
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  className?: string;
};

/**
 * The heart that saves a spot, shared by the feed cards and the spot page.
 *
 * Saving gives the heart one short pop — it is the only feedback the athlete gets from a list
 * that does not otherwise move — while un-saving just swaps the glyph, because shrinking a
 * heart away would read as losing something rather than putting it back.
 */
export function FavoriteButton({
  isFavorite,
  onPress,
  size = 'sm',
  variant = 'ghost',
  className,
}: FavoriteButtonProps) {
  const scheme = useScheme();
  const scale = useSharedValue(1);

  useEffect(() => {
    if (!isFavorite) {
      return;
    }

    scale.value = withSequence(
      withTiming(1.28, { duration: 120, reduceMotion: ReduceMotion.System }),
      withSpring(1, { damping: 12, stiffness: 220, reduceMotion: ReduceMotion.System }),
    );
  }, [isFavorite, scale]);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <IconButton
      accessibilityLabel={isFavorite ? t('spot.removeFavorite') : t('spot.addFavorite')}
      accessibilityState={{ selected: isFavorite }}
      className={className}
      icon={
        <Animated.View style={animatedStyle}>
          <Ionicons
            color={isFavorite ? statusColors.bad : schemeTextSecondary[scheme]}
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={iconSizeValues.sm}
          />
        </Animated.View>
      }
      onPress={onPress}
      size={size}
      variant={variant}
    />
  );
}
