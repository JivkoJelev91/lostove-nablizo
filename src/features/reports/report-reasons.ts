import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';

/** The reasons the database accepts, in the order the report sheet shows them. */
export const REPORT_REASONS = [
  'wrong_location',
  'does_not_exist',
  'equipment_wrong',
  'closed',
  'duplicate',
  'inappropriate',
] as const;

export type ReportReason = (typeof REPORT_REASONS)[number];

/** The most characters a report's free-text note accepts. */
export const REPORT_DETAILS_MAX_LENGTH = 300;

const REASON_LABELS: Record<ReportReason, TranslationKey> = {
  wrong_location: 'report.reason.wrong_location',
  does_not_exist: 'report.reason.does_not_exist',
  equipment_wrong: 'report.reason.equipment_wrong',
  closed: 'report.reason.closed',
  duplicate: 'report.reason.duplicate',
  inappropriate: 'report.reason.inappropriate',
};

/**
 * The Bulgarian sentence for a stored reason.
 *
 * The stored value is returned unchanged when it is not one this build knows — a reason added by
 * a later migration still has to read as itself in the queue rather than as an empty chip.
 */
export function reportReasonLabel(reason: string): string {
  const key = REASON_LABELS[reason as ReportReason];

  return key === undefined ? reason : t(key);
}
