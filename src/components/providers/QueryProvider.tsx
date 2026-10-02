import { QueryClientProvider, focusManager, onlineManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import type { ReactNode } from 'react';

import * as Network from 'expo-network';

import { queryClient } from '@/lib/query-client';

type QueryProviderProps = {
  children: ReactNode;
};

/**
 * Wires React Query's focus state to the app's foreground state.
 *
 * `refetchOnWindowFocus` is inert on native until something reports focus: there is no window,
 * and without this listener a stale screen never refreshes when the athlete brings the app back
 * from the background. That is exactly the moment they expect it to, especially after being
 * offline. Web keeps the library's own `visibilitychange` handling.
 */
function useAppStateFocus() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const subscription = AppState.addEventListener('change', (status) => {
      focusManager.setFocused(status === 'active');
    });

    return () => subscription.remove();
  }, []);
}

/**
 * Reports the device's connectivity to React Query.
 *
 * `refetchOnReconnect` is inert without this: the library only knows the network returned when
 * something tells it. `isInternetReachable` is the honest signal when the platform provides it —
 * a connected Wi-Fi network with no internet is still offline for the app — and an unknown value
 * is treated as reachable so the app does not claim to be offline on a platform that cannot say.
 */
function useConnectivity() {
  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    const update = (state: Network.NetworkState) => {
      onlineManager.setOnline(state.isConnected === true && state.isInternetReachable !== false);
    };

    const subscription = Network.addNetworkStateListener(update);

    // The listener reports changes; this reads the state the app started in.
    void Network.getNetworkStateAsync()
      .then(update)
      .catch(() => {
        // An unreadable state is not an offline state; the listener will report the truth later.
      });

    return () => subscription.remove();
  }, []);
}

export function QueryProvider({ children }: QueryProviderProps) {
  useAppStateFocus();
  useConnectivity();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
