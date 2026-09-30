import type { ReactNode } from 'react';
import { Circle, G, Line, Svg } from 'react-native-svg';

import { brandColors, iconSizeValues } from '@/constants/design-tokens';

export type EquipmentIconProps = {
  /** Rendered size in points. Defaults to the small icon token. */
  size?: number;
  /** Stroke colour. Defaults to the brand colour. */
  color?: string;
};

type EquipmentGlyphProps = EquipmentIconProps & {
  children: ReactNode;
};

function EquipmentGlyph({
  size = iconSizeValues.xs,
  color = brandColors.primary,
  children,
}: EquipmentGlyphProps) {
  return (
    <Svg fill="none" height={size} viewBox="0 0 24 24" width={size}>
      <G stroke={color} strokeLinecap="round" strokeLinejoin="round">
        {children}
      </G>
    </Svg>
  );
}

/** A pull-up frame: long uprights with the bar near the top. */
export function PullUpBarIcon(props: EquipmentIconProps) {
  return (
    <EquipmentGlyph {...props}>
      <Line strokeWidth={2} x1={5} x2={5} y1={2.5} y2={21.5} />
      <Line strokeWidth={2} x1={19} x2={19} y1={2.5} y2={21.5} />
      <Line strokeWidth={2} x1={2.5} x2={21.5} y1={5.5} y2={5.5} />
    </EquipmentGlyph>
  );
}

/** A pair of gymnastic rings hanging from straps. */
export function RingsIcon(props: EquipmentIconProps) {
  return (
    <EquipmentGlyph {...props}>
      <Line strokeWidth={1.75} x1={6.5} x2={6.5} y1={2.5} y2={13} />
      <Line strokeWidth={1.75} x1={17.5} x2={17.5} y1={2.5} y2={13} />
      <Circle cx={6.5} cy={17} r={3.3} strokeWidth={2.25} />
      <Circle cx={17.5} cy={17} r={3.3} strokeWidth={2.25} />
    </EquipmentGlyph>
  );
}

/** Parallel dip bars: two uprights crossed by two bars. */
export function DipBarsIcon(props: EquipmentIconProps) {
  return (
    <EquipmentGlyph {...props}>
      <Line strokeWidth={2} x1={5} x2={5} y1={2.5} y2={21.5} />
      <Line strokeWidth={2} x1={19} x2={19} y1={2.5} y2={21.5} />
      <Line strokeWidth={2} x1={2.5} x2={21.5} y1={9.5} y2={9.5} />
      <Line strokeWidth={2} x1={2.5} x2={21.5} y1={14.5} y2={14.5} />
    </EquipmentGlyph>
  );
}
