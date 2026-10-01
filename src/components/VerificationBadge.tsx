import { Text, View } from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import {
  brandColors,
  iconSizeValues,
  schemeTextSecondary,
  statusColors,
} from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';
import { DAY_IN_MS } from '@/utils/dates';
import { cn } from '@/utils/cn';

/** A verification date, either a `Date` or an ISO string. */
export type VerifiedAt = Date | string;

/**
 * How recent a verification is.
 *
 * The tone is the point: a badge only reads as a reassurance while it still means one, so the
 * colour moves green to amber to neutral as the date ages instead of the badge looking equally
 * trustworthy a year later.
 */
export type VerificationTone = 'fresh' | 'aging' | 'stale';

export type VerificationRecency = {
  label: string;
  tone: VerificationTone;
};

const FRESH_DAYS = 7;
const AGING_DAYS = 30;

const BORDER_TONE_CLASS: Record<VerificationTone, string> = {
  fresh: 'border-primary',
  aging: 'border-status-warning',
  stale: 'border-border',
};

const LABEL_TONE_CLASS: Record<VerificationTone, string> = {
  fresh: 'text-text-primary',
  aging: 'text-text-primary',
  stale: 'text-text-secondary',
};

/** The dictionary keys for each unit, so the wording lives in the translation table. */
const UNIT_KEYS = {
  day: { one: 'verification.day.one', few: 'verification.day.few' },
  week: { one: 'verification.week.one', few: 'verification.week.few' },
  month: { one: 'verification.month.one', few: 'verification.month.few' },
  year: { one: 'verification.year.one', few: 'verification.year.few' },
} as const satisfies Record<string, { one: TranslationKey; few: TranslationKey }>;

type Unit = keyof typeof UNIT_KEYS;

function verifiedLabel(unit: Unit, value: number): string {
  const keys = UNIT_KEYS[unit];

  return value === 1 ? t(keys.one) : t(keys.few, { count: value });
}

function toDate(value: VerifiedAt): Date | undefined {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

/**
 * Turns a verification date into the words and the tone a reader needs.
 *
 * Exported because anything else that summarises a verification, a list row or a map pin,
 * should say the same thing the badge says rather than re-derive it.
 */
export function describeVerification(
  verifiedAt: VerifiedAt,
  now: Date = new Date(),
): VerificationRecency {
  const date = toDate(verifiedAt);

  if (date === undefined) {
    return { label: t('verification.unknown'), tone: 'stale' };
  }

  const days = Math.max(0, Math.floor((now.getTime() - date.getTime()) / DAY_IN_MS));

  if (days < 1) {
    return { label: t('verification.today'), tone: 'fresh' };
  }

  const tone: VerificationTone =
    days <= FRESH_DAYS ? 'fresh' : days <= AGING_DAYS ? 'aging' : 'stale';

  if (days < 7) {
    return { label: verifiedLabel('day', days), tone };
  }

  if (days < AGING_DAYS) {
    return { label: verifiedLabel('week', Math.floor(days / 7)), tone };
  }

  if (days < 365) {
    return { label: verifiedLabel('month', Math.floor(days / 30)), tone };
  }

  return { label: verifiedLabel('year', Math.floor(days / 365)), tone };
}

export type VerificationBadgeProps = {
  verifiedAt: VerifiedAt;
  /** Replaces the wording, e.g. when a caller has its own localised date. */
  label?: string;
  className?: string;
};

/**
 * A badge that says when a spot was last verified.
 *
 * The wording and the colour both come from the date, so a spot cannot claim to be freshly
 * verified because a label was passed once and never updated.
 */
export function VerificationBadge({ verifiedAt, label, className }: VerificationBadgeProps) {
  const scheme = useScheme();
  const recency = describeVerification(verifiedAt);

  const iconColor: Record<VerificationTone, string> = {
    fresh: brandColors.primary,
    aging: statusColors.warning,
    stale: schemeTextSecondary[scheme],
  };

  return (
    <View
      accessible
      className={cn(
        'flex-row items-center gap-space-4 self-start rounded-pill border bg-bg-surface px-space-8 py-space-4',
        BORDER_TONE_CLASS[recency.tone],
        className,
      )}
    >
      <Ionicons
        color={iconColor[recency.tone]}
        name={recency.tone === 'stale' ? 'checkmark-circle-outline' : 'checkmark-circle'}
        size={iconSizeValues.xs}
      />
      <Text
        className={cn('font-medium text-caption', LABEL_TONE_CLASS[recency.tone])}
        numberOfLines={1}
      >
        {label ?? recency.label}
      </Text>
    </View>
  );
}
