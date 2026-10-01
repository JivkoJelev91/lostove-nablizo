import { Pressable, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { RATING_STAR_SIZES } from '@/components/Rating';
import type { RatingSize } from '@/components/Rating';
import { brandColors, schemeTextSecondary } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type RatingInputProps = {
  /** The chosen rating, `0` when nothing has been picked yet. */
  value: number;
  onChange: (rating: number) => void;
  max?: number;
  size?: RatingSize;
  accessibilityLabel?: string;
  className?: string;
};

/**
 * The interactive five-star row for picking a rating.
 *
 * Each star is its own button with an eight-point hit slop, so the row works with a thumb
 * rather than demanding a precise tap. Read-only ratings stay in {@link Rating}; this is the
 * one place a rating is chosen.
 */
export function RatingInput({
  value,
  onChange,
  max = 5,
  size = 'lg',
  accessibilityLabel = t('reviews.yourRating'),
  className,
}: RatingInputProps) {
  const scheme = useScheme();

  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="radiogroup"
      className={cn('flex-row items-center gap-space-8', className)}
    >
      {Array.from({ length: max }, (_, index) => {
        const rating = index + 1;
        const selected = rating <= value;

        return (
          <Pressable
            accessibilityLabel={t('rating.select', { value: rating, max })}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            className="p-space-4"
            hitSlop={8}
            key={rating}
            onPress={() => onChange(rating)}
          >
            <Ionicons
              color={selected ? brandColors.primary : schemeTextSecondary[scheme]}
              name={selected ? 'star' : 'star-outline'}
              size={RATING_STAR_SIZES[size]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}
