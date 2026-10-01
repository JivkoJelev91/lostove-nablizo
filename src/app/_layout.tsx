import '../../global.css';
import { useEffect } from 'react';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme } from 'nativewind';

import { schemeBackground, schemeStatusBarStyle } from '@/constants/design-tokens';
import { FavoritesProvider } from '@/features/favorites/FavoritesProvider';
import { ReviewsProvider } from '@/features/reviews/ReviewsProvider';
import { SpotsProvider } from '@/features/spots/SpotsProvider';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  // Inter is loaded for its side effect: the tree is deliberately not gated on it. Returning
  // null until fonts resolve leaves a permanently blank screen with no error when a font load
  // stalls, and rendering a few frames in the system font beats an undebuggable blank page.
  Font.useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // The native window behind the navigators, so the frames a screen transition exposes show
  // the app's background instead of the platform's white. Without this, pushing a route in
  // dark mode flashes light. Android-only; the catch keeps it quiet elsewhere.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(schemeBackground[scheme]).catch(() => {});
  }, [scheme]);

  return (
    <>
      <StatusBar style={schemeStatusBarStyle[scheme]} />
      {/* Above the navigator, so a heart tapped on a pushed spot page and the Favorites tab read
          the same saved spots, a review written on a spot page shows on the Profile tab's list of
          contributions, and a spot submitted in the Add tab is the same waiting-for-review spot
          the profile lists. Spots sit outermost because favourites and reviews resolve against
          them. */}
      <SpotsProvider>
        <FavoritesProvider>
          <ReviewsProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: schemeBackground[scheme] },
              }}
            />
          </ReviewsProvider>
        </FavoritesProvider>
      </SpotsProvider>
    </>
  );
}
