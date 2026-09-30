import { Stack } from 'expo-router';

/**
 * The gallery is a development surface, so it opts out of the app's own chrome: the root
 * layout hides headers and each screen draws its own back control, which keeps the preview
 * focused on the components rather than on navigation.
 */
export default function ComponentsLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
