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

function pad(value: number): string {
  return value.toString().padStart(2, '0');
}

/**
 * The same date with the time on it, e.g. `12 май 2024 г., 14:35`.
 *
 * Reviews use it: two reviews on the same day are told apart by when they were written, and
 * "today" is not enough to order them by.
 */
export function formatMonthDayYearTime(date: Date): string {
  return `${formatMonthDayYear(date)}, ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
