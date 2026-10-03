import '../../global.css';
import { useEffect } from 'react';
import {
  Oswald_400Regular,
  Oswald_500Medium,
  Oswald_600SemiBold,
  Oswald_700Bold,
} from '@expo-google-fonts/oswald';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useColorScheme } from 'nativewind';

import { QueryProvider } from '@/components/providers/QueryProvider';
import { OfflineBanner } from '@/components/OfflineBanner';
import { schemeBackground, schemeStatusBarStyle } from '@/constants/design-tokens';
import { SessionProvider } from '@/features/auth/SessionProvider';
import { FavoritesProvider } from '@/features/favorites/FavoritesProvider';

// Kept up until the first frame can be measured in the faces the app draws with. Text laid out
// while a font is still loading is measured in the fallback and drawn in the real face once it
// arrives, and the wider glyphs are then clipped at the fallback's width — a clipped label on
// every weighted piece of text. The call belongs at module scope: from inside the component it
// can run after the splash has gone.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  const [fontsLoaded, fontError] = Font.useFonts({
    Oswald_400Regular,
    Oswald_500Medium,
    Oswald_600SemiBold,
    Oswald_700Bold,
  });

  // An error releases the splash too: a fallback face is the right trade against an athlete stuck
  // on a splash screen forever, and the error path is the only one that can reach that state.
  useEffect(() => {
    if (fontsLoaded || fontError !== null) {
      SplashScreen.hide();
    }
  }, [fontsLoaded, fontError]);

  // The native window behind the navigators, so the frames a screen transition exposes show
  // the app's background instead of the platform's white. Without this, pushing a route in
  // dark mode flashes light. Android-only; the catch keeps it quiet elsewhere.
  useEffect(() => {
    void SystemUI.setBackgroundColorAsync(schemeBackground[scheme]).catch(() => {});
  }, [scheme]);

  if (!fontsLoaded && fontError === null) {
    return null;
  }

  return (
    <>
      <StatusBar style={schemeStatusBarStyle[scheme]} />
      <QueryProvider>
        {/* Favourites wrap the navigator, so a heart tapped on a pushed spot page and the
            Favorites tab read the same saved spots. Spots and reviews are not providers: they
            are TanStack Query caches over Supabase, so every screen reads the same rows instead
            of a copy that can drift. The session wraps everything because it is who the app is
            acting as. */}
        <SessionProvider>
          <FavoritesProvider>
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: schemeBackground[scheme] },
              }}
            />
            {/* Over everything, including pushed screens: connectivity is app-wide news. */}
            <OfflineBanner />
          </FavoritesProvider>
        </SessionProvider>
      </QueryProvider>
    </>
  );
}
