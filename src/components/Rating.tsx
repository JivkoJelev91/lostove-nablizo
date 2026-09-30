import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import { iconSizeValues, statusColors } from '@/constants/design-tokens';
import { cn } from '@/utils/cn';

export type RatingSize = 'sm' | 'md' | 'lg';

export type RatingProps = {
  /** Rating value, e.g. `4.7`. Clamped to `0..max` when rendering stars. */
  value: number;
  max?: number;
  /** Number of reviews, rendered as `(126)` after the value. */
  count?: number;
  size?: RatingSize;
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

/** A star rating with an optional numeric value and review count. */
export function Rating({
  value,
  max = 5,
  count,
  size = 'md',
  showValue = true,
  accessibilityLabel,
  className,
}: RatingProps) {
  const filled = Math.round(Math.min(Math.max(value, 0), max));
  const label =
    accessibilityLabel ??
    `Rated ${value} out of ${max}${count !== undefined ? `, ${count} reviews` : ''}`;

  return (
    <View
      accessibilityLabel={label}
      accessibilityRole="text"
      className={cn('flex-row items-center gap-space-4', className)}
    >
      <View accessible={false} className="flex-row items-center gap-space-2">
        {Array.from({ length: max }, (_, index) => (
          <Ionicons
            color={statusColors.warning}
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
