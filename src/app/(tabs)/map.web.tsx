import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState, GhostButton, ScreenShell } from '@/components';
import { brandColors, iconSizeValues } from '@/constants/design-tokens';

/**
 * The web build of the hidden map route.
 *
 * `react-native-maps` has no web implementation, and importing it takes down the whole web
 * bundle: its native component specs call `codegenNativeComponent`, which `react-native-web`
 * does not export. Metro picks this file on web so that import stays out of the web graph.
 */
export default function MapScreen() {
  return (
    <ScreenShell header={false} variant="tab">
      <EmptyState
        action={<GhostButton label="Back to spots" onPress={() => router.replace('/')} />}
        className="flex-1"
        description="The map is a native view. Open the app on iOS or Android to explore spots on the map."
        icon={<Ionicons color={brandColors.primary} name="map-outline" size={iconSizeValues.xl} />}
        title="No map on the web"
      />
    </ScreenShell>
  );
}
