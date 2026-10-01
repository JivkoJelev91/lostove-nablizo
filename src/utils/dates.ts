/** Milliseconds in a day, the unit that recency is measured in. */
export const DAY_IN_MS = 24 * 60 * 60 * 1000;

/** A `Date` `days` in the past. Mock galleries use it so relative wording stays accurate. */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * DAY_IN_MS);
}

const MONTH_NAMES = [
  'януари',
  'февруари',
  'март',
  'април',
  'май',
  'юни',
  'юли',
  'август',
  'септември',
  'октомври',
  'ноември',
  'декември',
] as const;

/** Formats a date the way Bulgarian writes one, e.g. `12 май 2024 г.`. */
export function formatMonthDayYear(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()] ?? '';
  return `${date.getDate()} ${month} ${date.getFullYear()} г.`;
}
