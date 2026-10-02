import { Text, View } from 'react-native';

import * as Network from 'expo-network';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { spacingValues } from '@/constants/design-tokens';
import { t } from '@/i18n';

/**
 * A thin notice across the top while the device has no usable connection.
 *
 * It explains what the screens cannot: an error state and a stale list look the same whether the
 * server refused or the phone is in a tunnel. The banner is informational only — every screen
 * already carries its own retry — so it never intercepts touches and disappears on its own when
 * the connection returns.
 */
export function OfflineBanner() {
  const network = Network.useNetworkState();
  const insets = useSafeAreaInsets();

  const offline = network.isConnected === false || network.isInternetReachable === false;

  if (!offline) {
    return null;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      className="absolute inset-x-0 top-0 z-50 items-center bg-status-warning-soft px-screen-px"
      pointerEvents="none"
      style={{ paddingTop: insets.top + spacingValues[8] }}
    >
      <Text className="pb-space-8 font-medium text-caption text-status-warning">
        {t('common.offline')}
      </Text>
    </View>
  );
}
