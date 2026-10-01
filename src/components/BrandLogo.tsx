import { Text, View } from 'react-native';

import { Circle, G, Line, Svg } from 'react-native-svg';

import { brandColors, iconSizeValues } from '@/constants/design-tokens';
import { t } from '@/i18n';
import { cn } from '@/utils/cn';

export type BrandLogoProps = {
  className?: string;
};

/**
 * The mark's glyph: a bar with a figure hanging from it, knees tucked.
 *
 * Drawn here rather than reused from the equipment icons, because the brand mark is not an
 * equipment label. It has to read as somebody doing a pull-up at twenty points, which the
 * equipment chip's empty frame deliberately does not.
 */
function PullUpFigure({ color, size }: { color: string; size: number }) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <G stroke={color} strokeLinecap="round" strokeLinejoin="round">
        <Line strokeWidth={2} x1={3} x2={21} y1={3} y2={3} />
        <Line strokeWidth={1.9} x1={10.4} x2={10} y1={9.8} y2={3.1} />
        <Line strokeWidth={1.9} x1={13.6} x2={14} y1={9.8} y2={3.1} />
        <Line strokeWidth={1.9} x1={12} x2={12} y1={9.8} y2={14.4} />
        <Line strokeWidth={1.9} x1={12} x2={8.9} y1={14.4} y2={17} />
        <Line strokeWidth={1.9} x1={8.9} x2={11.7} y1={17} y2={20.4} />
        <Line strokeWidth={1.9} x1={12} x2={15.1} y1={14.4} y2={17} />
        <Line strokeWidth={1.9} x1={15.1} x2={12.3} y1={17} y2={20.4} />
        <Circle cx={12} cy={7.7} r={1.85} strokeWidth={1.9} />
      </G>
    </Svg>
  );
}

/**
 * The app's mark: the pull-up figure in the lime circle with the name beside it.
 *
 * A plain view, no animation and no size variants — the brand is part of the Home header, not an
 * event. An opening animation that covered the first screen only got in the way of it, so the
 * mark is simply there when the app starts.
 */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <View className={cn('flex-row items-center gap-space-8', className)}>
      <View className="h-icon-lg w-icon-lg items-center justify-center rounded-pill bg-primary">
        <PullUpFigure color={brandColors.onPrimary} size={iconSizeValues.sm} />
      </View>

      <Text className="font-bold text-h3 text-text-primary">{t('common.appName')}</Text>
    </View>
  );
}
