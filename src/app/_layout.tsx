import '../../global.css';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import * as Font from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import { schemeBackground, schemeStatusBarStyle } from '@/constants/design-tokens';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const scheme = colorScheme === 'dark' ? 'dark' : 'light';

  const [fontsLoaded, fontError] = Font.useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar style={schemeStatusBarStyle[scheme]} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: schemeBackground[scheme] },
        }}
      />
    </>
  );
}
