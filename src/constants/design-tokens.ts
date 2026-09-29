/**
 * Design tokens for the places that need a value in TypeScript rather than a class.
 *
 * `tailwind.config.js` reads `designSystem.json` for styling, and this module reads the same
 * file for the few things Tailwind cannot style: navigator options, `StatusBar` and any
 * other API that takes a plain colour string. Both read the one JSON file, so neither can
 * drift from the design system or from the other.
 *
 * Prefer a Tailwind class over these values. They exist for props that accept a colour
 * string, not as an alternative styling system.
 *
 * @see designSystem.json
 */
import { designSystem } from '../../designSystem.json';

export type ColorScheme = 'light' | 'dark';

const { colors } = designSystem;

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

export const brandColors = {
  primary: colors.primary.base,
  onPrimary: colors.text.onPrimary,
  scrim: colors.overlay.scrim,
} as const;
