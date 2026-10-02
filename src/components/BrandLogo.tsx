import { Text, View } from 'react-native';

import { Circle, G, Line, Path, Svg } from 'react-native-svg';

import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type BrandLogoProps = {
  className?: string;
};

/**
 * The mark: an athlete pulling up on a bar, drawn in a single stroke weight.
 *
 * The bar runs past both hands, the head sits above it, the elbows hang below and out, one leg
 * tucks and the other drops, so the pose still reads as a pull-up at twenty-four points. Built
 * from two mirrored paths around a bar and a head rather than one continuous line, because a
 * single path cannot turn at the shoulders without showing the join.
 */
function PullUpMark({ color, size }: { color: string; size: number }) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <G stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <Line strokeWidth={1.9} x1={2.4} x2={21.6} y1={5} y2={5} />
        <Circle cx={12} cy={3.4} r={1.7} strokeWidth={1.7} />
        <Path d="M15.2 5L17.3 8.5L13.6 7.1L12.7 14.6L14.1 17.9L13.3 20.9" strokeWidth={1.7} />
        <Path d="M8.8 5L6.7 8.5L10.4 7.1L11.3 14.6L9.3 16.5L11.9 18.4" strokeWidth={1.7} />
      </G>
    </Svg>
  );
}

/**
 * The app's mark: the athlete in the lime circle with the name beside it.
 *
 * A plain view, no animation and no size variants — the brand is part of the Home header, not an
 * event. An opening animation that covered the first screen only got in the way of it, so the
 * mark is simply there when the app starts.
 */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <View className={cn('flex-row items-center gap-space-8', className)}>
      {/* Decorative: the wordmark beside it already says the app's name. */}
      <View
        accessibilityElementsHidden
        accessible={false}
        className="h-icon-lg w-icon-lg items-center justify-center rounded-pill bg-primary"
        importantForAccessibility="no-hide-descendants"
      >
        <PullUpMark color={brandColors.onPrimary} size={iconSizeValues.md} />
      </View>

      <Text className="font-bold text-h1 text-text-primary">{t('common.appName')}</Text>
    </View>
  );
}
