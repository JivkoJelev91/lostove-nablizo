/** Milliseconds in a day, the unit that recency is measured in. */
export const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** A `Date` `days` in the past. Mock galleries use it so relative wording stays accurate. */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_IN_MS);
}

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

/** Formats a date the way the designs write one, e.g. `May 12, 2024`. */
export function formatMonthDayYear(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()] ?? '';
  return `${month} ${date.getDate()}, ${date.getFullYear()}`;
}
