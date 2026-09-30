import { useCallback, useEffect, useRef } from 'react';

import { router, useNavigation } from 'expo-router';

/**
 * Keeps a dirty screen from being popped by the platform's own back affordances.
 *
 * Android's back button pops the screen without going through the screen's buttons, and
 * `beforeRemove` is the event that pop runs through. Intercepting it there is what makes
 * "you have unsaved changes" true for every exit rather than only for the header's.
 *
 * @param isDirty   Whether leaving would discard something worth asking about.
 * @param onBlocked Called instead of the pop while `isDirty` is true.
 * @returns The leave action for exits the athlete has already confirmed; it skips the guard.
 */
export function useUnsavedChangesGuard(isDirty: boolean, onBlocked: () => void): () => void {
  const navigation = useNavigation();
  const leavingRef = useRef(false);

  useEffect(() => {
    if (!isDirty) {
      return;
    }

    return navigation.addListener('beforeRemove', (event) => {
      if (leavingRef.current) {
        return;
      }

      event.preventDefault();
      onBlocked();
    });
  }, [isDirty, navigation, onBlocked]);

  return useCallback(() => {
    leavingRef.current = true;
    router.back();
  }, []);
}
