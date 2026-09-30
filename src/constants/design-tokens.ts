/**
 * Design tokens for the places that need a value in TypeScript rather than a class.
 *
 * `tailwind.config.js` reads `designSystem.json` for styling, and this module reads the same
 * file for the few things Tailwind cannot style: navigator options, `StatusBar`, icon sizes and
 * any other API that takes a plain value. Both read the one JSON file, so neither can drift from
 * the design system or from the other.
 *
 * Prefer a Tailwind class over these values. They exist for props that accept a colour string or
 * a number, not as an alternative styling system.
 *
 * @see designSystem.json
 */
import { designSystem } from '../../designSystem.json';

export type ColorScheme = 'light' | 'dark';

const { colors, iconSizes } = designSystem;

/** Background colours the navigation container and status bar need per scheme. */
export const schemeBackground: Record<ColorScheme, string> = {
  light: colors.bg.main.light,
  dark: colors.bg.main.dark,
};

/** Status-bar content colour per scheme, inverted against the background. */
export const schemeStatusBarStyle: Record<ColorScheme, 'light' | 'dark'> = {
  light: 'dark',
  dark: 'light',
};

/**
 * Placeholder colour per scheme, for `TextInput`'s `placeholderTextColor` prop.
 *
 * This is a plain string prop, so it cannot resolve through a NativeWind class and has to
 * follow the active scheme explicitly. Components read it with NativeWind's `useColorScheme`.
 */
export const schemePlaceholderColor: Record<ColorScheme, string> = {
  light: colors.text.muted.light,
  dark: colors.text.muted.dark,
};

/** Primary text colour per scheme, for icon APIs that take a colour string. */
export const schemeTextPrimary: Record<ColorScheme, string> = {
  light: colors.text.primary.light,
  dark: colors.text.primary.dark,
};

/** Secondary text colour per scheme, for icon APIs that take a colour string. */
export const schemeTextSecondary: Record<ColorScheme, string> = {
  light: colors.text.secondary.light,
  dark: colors.text.secondary.dark,
};

export const brandColors = {
  primary: colors.primary.base,
  onPrimary: colors.text.onPrimary,
  onSecondary: colors.text.onSecondary,
  scrim: colors.overlay.scrim,
} as const;

/** Status colours for icon APIs that take a colour string rather than a class. */
export const statusColors = {
  good: colors.status.good,
  warning: colors.status.warning,
  bad: colors.status.bad,
} as const;

/** Icon dimensions keyed by the design system's size names. */
export const iconSizeValues = {
  xs: iconSizes.xs,
  sm: iconSizes.sm,
  md: iconSizes.md,
  lg: iconSizes.lg,
  xl: iconSizes.xl,
} as const;

export type IconSize = keyof typeof iconSizeValues;
