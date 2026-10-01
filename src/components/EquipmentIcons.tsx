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

/** Monkey bars: an overhead ladder, two uprights holding three rungs. */
export function MonkeyBarsIcon(props: EquipmentIconProps) {
  return (
    <EquipmentGlyph {...props}>
      <Line strokeWidth={2} x1={5.5} x2={5.5} y1={2.5} y2={21.5} />
      <Line strokeWidth={2} x1={18.5} x2={18.5} y1={2.5} y2={21.5} />
      <Line strokeWidth={2} x1={5.5} x2={18.5} y1={5.5} y2={5.5} />
      <Line strokeWidth={2} x1={5.5} x2={18.5} y1={12} y2={12} />
      <Line strokeWidth={2} x1={5.5} x2={18.5} y1={18.5} y2={18.5} />
    </EquipmentGlyph>
  );
}

/** A ladder: two close-set rails joined by three rungs. */
export function LadderIcon(props: EquipmentIconProps) {
  return (
    <EquipmentGlyph {...props}>
      <Line strokeWidth={2} x1={8.5} x2={8.5} y1={2.5} y2={21.5} />
      <Line strokeWidth={2} x1={15.5} x2={15.5} y1={2.5} y2={21.5} />
      <Line strokeWidth={2} x1={8.5} x2={15.5} y1={6} y2={6} />
      <Line strokeWidth={2} x1={8.5} x2={15.5} y1={12} y2={12} />
      <Line strokeWidth={2} x1={8.5} x2={15.5} y1={18} y2={18} />
    </EquipmentGlyph>
  );
}

/** A sit-up bench: a flat pad rising into an incline, with the foot roller at the high end. */
export function SitUpBenchIcon(props: EquipmentIconProps) {
  return (
    <EquipmentGlyph {...props}>
      <Line strokeWidth={2} x1={3.5} x2={15} y1={16.5} y2={16.5} />
      <Line strokeWidth={2} x1={15} x2={20} y1={16.5} y2={11} />
      <Line strokeWidth={2} x1={5.5} x2={5.5} y1={16.5} y2={21.5} />
      <Line strokeWidth={2} x1={13} x2={13} y1={16.5} y2={21.5} />
      <Circle cx={20} cy={8.5} r={1.9} strokeWidth={2} />
    </EquipmentGlyph>
  );
}

/** Push-up bars: two low parallel handles set a shoulder-width apart. */
export function PushUpBarsIcon(props: EquipmentIconProps) {
  return (
    <EquipmentGlyph {...props}>
      <Line strokeWidth={2} x1={4} x2={4} y1={20} y2={12.5} />
      <Line strokeWidth={2} x1={8} x2={8} y1={20} y2={12.5} />
      <Line strokeWidth={2} x1={4} x2={8} y1={12.5} y2={12.5} />
      <Line strokeWidth={2} x1={16} x2={16} y1={20} y2={12.5} />
      <Line strokeWidth={2} x1={20} x2={20} y1={20} y2={12.5} />
      <Line strokeWidth={2} x1={16} x2={20} y1={12.5} y2={12.5} />
    </EquipmentGlyph>
  );
}
