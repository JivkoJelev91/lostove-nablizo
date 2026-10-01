import { ACCOUNT } from '@/i18n/translations/account';
import { COMMON } from '@/i18n/translations/common';
import { DISCOVERY } from '@/i18n/translations/discovery';
import { EDITOR } from '@/i18n/translations/editor';
import { SPOT } from '@/i18n/translations/spot';

/**
 * Every string the UI can show, in one lookup.
 *
 * The modules are split by area so no file outgrows the lint limit and a translator can work
 * on one screen group at a time; the keys are namespaced by area, so merging cannot hide a
 * collision. The app ships one locale today, so this is simply that locale's table.
 */
export const TRANSLATIONS = {
  ...COMMON,
  ...DISCOVERY,
  ...SPOT,
  ...EDITOR,
  ...ACCOUNT,
};

export type TranslationKey = keyof typeof TRANSLATIONS;
