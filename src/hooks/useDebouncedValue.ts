import { useEffect, useState } from 'react';

/**
 * A value that only settles after it has stopped changing for `delayMs`.
 *
 * Used to keep a keystroke from becoming its own request: the input stays instant, while the
 * value a query reads updates once the typing pauses.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);

    return () => clearTimeout(timeout);
  }, [delayMs, value]);

  return debounced;
}
