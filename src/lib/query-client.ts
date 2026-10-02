import { QueryClient } from '@tanstack/react-query';

/**
 * The app's query defaults.
 *
 * `networkMode: 'always'` is deliberate for both queries and mutations. React Query's default is
 * to pause a request while it believes the device is offline and resume it on reconnect, which
 * sounds friendly but leaves the athlete looking at a spinner that will not resolve and a write
 * whose fate is invisible. This app is not offline-first: a request made without a connection is
 * attempted, fails quickly, and lands in the same error-and-retry UI every other failure uses.
 * Reconnecting still refreshes what is on screen, because `refetchOnReconnect` plus the
 * `onlineManager` wiring in `QueryProvider` fire when the connection returns.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      networkMode: 'always',
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30_000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      networkMode: 'always',
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export const createQueryClient = () => queryClient;
