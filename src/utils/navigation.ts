import { router } from 'expo-router';

/**
 * Leaves the current screen, whether or not the router has history behind it.
 *
 * A pushed screen can be the first route when it was opened from a shared link, in which case
 * `router.back()` has nowhere to pop and leaves the athlete stuck. Falling back to the feed
 * replaces that dead end with the app's home.
 */
export function goBackOrHome(): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }

  router.replace('/');
}
