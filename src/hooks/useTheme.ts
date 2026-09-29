/**
 * Theme access for components.
 *
 * Reads the system colour scheme and returns the matching token set from
 * `@/constants/theme`. Components read tokens from here rather than importing the raw
 * constants, so a light/dark change re-renders them.
 *
 * @see src/constants/theme.ts
 */

import { DarkTheme, DefaultTheme } from 'expo-router';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import type { ColorSchemeName } from 'react-native';

import { themes } from '@/constants/theme';
import type { ColorScheme, Theme } from '@/constants/theme';

/** Anything other than an explicit dark scheme, including Android's `unspecified`, reads as light. */
function resolveScheme(scheme: ColorSchemeName): ColorScheme {
  return scheme === 'dark' ? 'dark' : 'light';
}

/** The token set for the active colour scheme. */
export function useTheme(): Theme {
  const scheme = useColorScheme();
  return themes[resolveScheme(scheme)];
}

/**
 * A React Navigation theme matching the app tokens.
 *
 * Spreading the default theme keeps the structural keys navigation expects, then the design
 * tokens override only the colours. Without this the header and background would stay on
 * navigation's stock colours while the rest of the screen follows the design system.
 */
export function useNavigationTheme() {
  const theme = useTheme();
  const base = theme.scheme === 'dark' ? DarkTheme : DefaultTheme;

  return useMemo(
    () => ({
      ...base,
      dark: theme.scheme === 'dark',
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.card,
        text: theme.colors.text,
        border: theme.colors.border,
        notification: theme.colors.error,
      },
    }),
    [base, theme],
  );
}
