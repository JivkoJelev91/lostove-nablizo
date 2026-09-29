/**
 * Design tokens, typed.
 *
 * `designSystem.json` at the repository root is the design artifact and the source of truth
 * for design decisions. This module mirrors it for the app: resolved for a colour scheme and
 * typed so a typo is a compile error rather than a wrong colour at runtime.
 *
 * A `weight` in the JSON is applied here as a weight-specific `fontFamily` (`Inter_700Bold`)
 * and deliberately not as a `fontWeight` value. Naming the loaded family carries the weight;
 * also setting `fontWeight` makes Android synthesise a second, blurrier weight on top.
 *
 * @see designSystem.json
 */

import { Platform } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

export type ColorScheme = 'light' | 'dark';

export type ThemeColors = {
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  secondary: string;
  secondaryPressed: string;
  onSecondary: string;
  background: string;
  surface: string;
  card: string;
  cardElevated: string;
  input: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  successSoft: string;
  warningSoft: string;
  errorSoft: string;
  scrim: string;
  mapPinText: string;
};

export const fontFamilies = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
} as const;

export const spacing = {
  space2: 2,
  space4: 4,
  space8: 8,
  space12: 12,
  space16: 16,
  space20: 20,
  space24: 24,
  space32: 32,
  space40: 40,
} as const;

/**
 * Screen-relative layout rules. These are the numbers a component should reach for instead of
 * inventing its own, so screens stay aligned to the same grid.
 */
export const layout = {
  screenHorizontalPadding: 16,
  sectionGap: 24,
  sectionGapLarge: 32,
  cardPadding: 16,
  cardGap: 8,
  cardGapLarge: 16,
  listGap: 12,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  pill: 999,
} as const;

export const iconSizes = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
} as const;

export const typography = {
  display: { fontFamily: fontFamilies.bold, fontSize: 24, lineHeight: 30, letterSpacing: -0.4 },
  h1: { fontFamily: fontFamilies.bold, fontSize: 22, lineHeight: 28, letterSpacing: -0.3 },
  h2: { fontFamily: fontFamilies.semibold, fontSize: 18, lineHeight: 24, letterSpacing: -0.2 },
  h3: { fontFamily: fontFamilies.semibold, fontSize: 16, lineHeight: 22, letterSpacing: -0.1 },
  body: { fontFamily: fontFamilies.regular, fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: fontFamilies.regular, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fontFamilies.medium, fontSize: 12, lineHeight: 16 },
} satisfies Record<string, TextStyle>;

export type TypographyStyle = keyof typeof typography;

/** Shadow styles carry an iOS shadow and an Android elevation, because neither platform honours the other's. */
export const shadows = {
  card: Platform.select<ViewStyle>({
    ios: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowColor: '#000000',
    },
    android: { elevation: 2 },
    default: {},
  }),
  cardElevated: Platform.select<ViewStyle>({
    ios: {
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.14,
      shadowRadius: 16,
      shadowColor: '#000000',
    },
    android: { elevation: 8 },
    default: {},
  }),
  button: Platform.select<ViewStyle>({
    ios: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.12,
      shadowRadius: 2,
      shadowColor: '#000000',
    },
    android: { elevation: 2 },
    default: {},
  }),
} satisfies Record<string, ViewStyle>;

const statusColors = {
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  successSoft: '#DCFCE7',
  warningSoft: '#FEF3C7',
  errorSoft: '#FEE2E2',
  scrim: 'rgba(11, 11, 15, 0.45)',
} as const;

const lightColors: ThemeColors = {
  primary: '#A3FF12',
  primaryPressed: '#8CE60F',
  onPrimary: '#0B0B0F',
  secondary: '#1A1A1F',
  secondaryPressed: '#2A2A31',
  onSecondary: '#FFFFFF',
  background: '#FFFFFF',
  surface: '#F5F5F7',
  card: '#FFFFFF',
  cardElevated: '#FFFFFF',
  input: '#F5F5F7',
  text: '#0B0B0F',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  ...statusColors,
  mapPinText: '#0B0B0F',
};

const darkColors: ThemeColors = {
  primary: '#A3FF12',
  primaryPressed: '#8CE60F',
  onPrimary: '#0B0B0F',
  secondary: '#E8E8EC',
  secondaryPressed: '#FFFFFF',
  onSecondary: '#0B0B0F',
  background: '#0B0B0F',
  surface: '#15151A',
  card: '#15151A',
  cardElevated: '#1E1E24',
  input: '#15151A',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#27272A',
  ...statusColors,
  mapPinText: '#0B0B0F',
};

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  layout: typeof layout;
  radius: typeof radius;
  iconSizes: typeof iconSizes;
  typography: typeof typography;
  shadows: typeof shadows;
};

export const themes: Record<ColorScheme, Theme> = {
  light: {
    scheme: 'light',
    colors: lightColors,
    spacing,
    layout,
    radius,
    iconSizes,
    typography,
    shadows,
  },
  dark: {
    scheme: 'dark',
    colors: darkColors,
    spacing,
    layout,
    radius,
    iconSizes,
    typography,
    shadows,
  },
};
