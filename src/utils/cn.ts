/**
 * Joins class names into a single `className` string, dropping falsy values.
 *
 * Every class stays a literal at the call site, which is what Tailwind needs: it only emits
 * CSS for class names it can read as plain text, so a class must never be assembled by
 * interpolation. `cn` exists to pick between literals, not to build new ones.
 *
 * @example
 * cn('rounded-pill', isActive && 'bg-primary', disabled && 'opacity-60')
 */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
