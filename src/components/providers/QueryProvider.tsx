import { QueryClientProvider, focusManager } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';
import type { ReactNode } from 'react';

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

export function QueryProvider({ children }: QueryProviderProps) {
  useAppStateFocus();

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
