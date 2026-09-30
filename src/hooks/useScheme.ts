import { useColorScheme } from 'nativewind';

import type { ColorScheme } from '@/constants/design-tokens';

/**
 * The active colour scheme, narrowed to the two values the design system knows.
 *
 * NativeWind reports `null` while the scheme is unresolved; this treats that as light so
 * callers always get a concrete scheme for props that need a colour string.
 */
export function useScheme(): ColorScheme {
  const { colorScheme } = useColorScheme();
  return colorScheme === 'dark' ? 'dark' : 'light';
}
