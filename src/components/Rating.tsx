import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { cn } from '@/utils/cn';

export type RatingSize = 'sm' | 'md' | 'lg';

/**
 * `stars` draws the full five-star row for a review; `summary` condenses the same facts into
 * one lime star plus `4.7 · 28 reviews`, which is what a spot card shows.
 */
export type RatingVariant = 'stars' | 'summary';

export type RatingProps = {
  /** Rating value, e.g. `4.7`. Clamped to `0..max` when rendering stars. */
  value: number;
  max?: number;
  /** Number of reviews, rendered as `(126)` after the value in `stars` mode. */
  count?: number;
  size?: RatingSize;
  variant?: RatingVariant;
  /** Hides the numeric value, leaving only the stars. */
  showValue?: boolean;
  accessibilityLabel?: string;
  className?: string;
};

const STAR_SIZE: Record<RatingSize, number> = {
  sm: iconSizeValues.xs,
  md: iconSizeValues.sm,
  lg: iconSizeValues.md,
};

const VALUE_TEXT_CLASS: Record<RatingSize, string> = {
  sm: 'text-caption',
  md: 'text-bodySmall',
  lg: 'text-body',
};

const SUMMARY_TEXT_CLASS: Record<RatingSize, string> = {
  sm: 'text-bodySmall',
  md: 'text-body',
  lg: 'text-body',
};

/** A rating with an optional numeric value and review count, in stars or summary form. */
export function Rating({
  value,
  max = 5,
  count,
  size = 'md',
  variant = 'stars',
  showValue = true,
  accessibilityLabel,
  className,
}: RatingProps) {
  const filled = Math.round(Math.min(Math.max(value, 0), max));
  const label =
    accessibilityLabel ??
    `Rated ${value} out of ${max}${count !== undefined ? `, ${count} reviews` : ''}`;

  if (variant === 'summary') {
    return (
      <View
        accessibilityLabel={label}
        accessibilityRole="text"
        className={cn('flex-row items-center gap-space-4', className)}
      >
        <Ionicons color={brandColors.primary} name="star" size={STAR_SIZE[size]} />

        {showValue ? (
          <Text className={cn('font-semibold text-text-primary', SUMMARY_TEXT_CLASS[size])}>
            {value.toFixed(1)}
          </Text>
        ) : null}

        {count !== undefined ? (
          <Text className={cn('text-text-secondary', SUMMARY_TEXT_CLASS[size])}>
            {`${showValue ? '· ' : ''}${count} ${count === 1 ? 'review' : 'reviews'}`}
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="text"
      className={cn('flex-row items-center gap-space-4', className)}
    >
      <View accessible={false} className="flex-row items-center gap-space-2">
        {Array.from({ length: max }, (_, index) => (
          <Ionicons
            color={brandColors.primary}
            key={index}
            name={index < filled ? 'star' : 'star-outline'}
            size={STAR_SIZE[size]}
          />
        ))}
      </View>

      {showValue ? (
        <Text
          className={cn('font-semibold text-text-primary', VALUE_TEXT_CLASS[size])}
        >{`${value.toFixed(1)}`}</Text>
      ) : null}

      {count !== undefined ? (
        <Text className="text-bodySmall text-text-secondary">{`(${count})`}</Text>
      ) : null}
    </View>
  );
}
