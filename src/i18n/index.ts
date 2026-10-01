import { TRANSLATIONS } from '@/i18n/translations';
import type { TranslationKey } from '@/i18n/translations';

export type { TranslationKey };

/** Values substituted into a `{placeholder}` in a translation's text. */
export type TranslationParams = Record<string, string | number>;

/**
 * The one way a component gets a visible string.
 *
 * Text lives in the translation table, never in the component, so switching the app to another
 * language later is a table swap rather than a sweep through every screen. Parameters fill
 * `{name}` placeholders; a missing key cannot reach here because the key type is derived from
 * the table itself.
 */
export function t(key: TranslationKey, params?: TranslationParams): string {
  const template: string = TRANSLATIONS[key];

  if (params === undefined) {
    return template;
  }

  return Object.entries(params).reduce(
    (text, [name, value]) => text.split(`{${name}}`).join(String(value)),
    template,
  );
}

/** `1 отзив` / `2 отзива`, the only count the app currently has to decline. */
export function reviewCountLabel(count: number): string {
  return count === 1 ? t('rating.review.one', { count }) : t('rating.review.few', { count });
}

/** One decimal with the comma Bulgarian writes, e.g. `4,7`. */
export function formatDecimal(value: number, fractionDigits = 1): string {
  return value.toFixed(fractionDigits).replace('.', ',');
}
