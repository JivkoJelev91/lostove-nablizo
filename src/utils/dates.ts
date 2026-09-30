/** Milliseconds in a day, the unit that recency is measured in. */
export const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** A `Date` `days` in the past. Mock galleries use it so relative wording stays accurate. */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_IN_MS);
}
