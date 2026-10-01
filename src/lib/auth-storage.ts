import AsyncStorage from '@react-native-async-storage/async-storage';

import type { SupportedStorage } from '@supabase/supabase-js';

/**
 * Where Supabase Auth keeps the session.
 *
 * AsyncStorage is the right store on a device and in the browser, but its web build reads
 * `window.localStorage` directly — and Expo renders the static web output in Node, where there is no
 * window. `supabase-js` loads the stored session as soon as the client is constructed, so that gap
 * is hit on every prerender rather than lazily on first use; without this guard the render dies with
 * `ReferenceError: window is not defined` and takes the dev server with it.
 *
 * With no window there is also no browser to keep a session for, so an empty store is the honest
 * answer: the prerendered HTML is the signed-out shell, and the real session is read during
 * hydration, when a window exists again. Every method returns a promise on both paths, because the
 * client awaits the result either way.
 */
const hasWindow = (): boolean => typeof window !== 'undefined';

export const authStorage: SupportedStorage = {
  getItem: (key) => Promise.resolve(hasWindow() ? AsyncStorage.getItem(key) : null),
  setItem: (key, value) =>
    Promise.resolve(hasWindow() ? AsyncStorage.setItem(key, value) : undefined),
  removeItem: (key) => Promise.resolve(hasWindow() ? AsyncStorage.removeItem(key) : undefined),
};
