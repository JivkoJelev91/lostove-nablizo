import { ActivityIndicator, Text, View } from 'react-native';

import { brandColors } from '@/constants/design-tokens';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type LoadingSpinnerSize = 'sm' | 'md' | 'lg';

export type LoadingSpinnerProps = {
  size?: LoadingSpinnerSize;
  /** Text shown beneath the indicator, also used as the accessibility label. */
  label?: string;
  className?: string;
};

const INDICATOR_SIZE: Record<LoadingSpinnerSize, 'small' | 'large'> = {
  sm: 'small',
  md: 'small',
  lg: 'large',
};

/** An activity indicator in the brand colour, optionally captioned. */
export function LoadingSpinner({ size = 'md', label, className }: LoadingSpinnerProps) {
  return (
    <View
      accessibilityLabel={label ?? t('common.loading')}
      accessibilityRole="progressbar"
      className={cn('items-center justify-center gap-space-8', className)}
    >
      <ActivityIndicator color={brandColors.primary} size={INDICATOR_SIZE[size]} />
      {label !== undefined ? (
        <Text className="text-bodySmall text-text-secondary">{label}</Text>
      ) : null}
    </View>
  );
}
