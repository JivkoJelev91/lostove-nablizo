import { Ionicons } from '@expo/vector-icons';

import { StatusChip } from '@/components/Chip';
import type { StatusTone } from '@/components/Chip';
import { iconSizeValues, schemeTextSecondary, statusColors } from '@/constants/design-tokens';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';

/**
 * Where a spot sits in the directory's moderation. Only `approved` spots are public; every
 * other state is shown to the athlete who added the spot, so a submission never disappears
 * without an explanation.
 */
export type SpotStatus = 'under_review' | 'approved' | 'rejected' | 'closed';

/** The words a status is shown with, wherever one appears. */
export const SPOT_STATUS_LABEL: Record<SpotStatus, string> = {
  under_review: t('status.under_review'),
  approved: t('status.approved'),
  rejected: t('status.rejected'),
  closed: t('status.closed'),
};

type StatusAppearance = {
  tone: StatusTone;
  icon: keyof typeof Ionicons.glyphMap;
  /** Fixed for the tone-coloured states; the neutral one follows the scheme. */
  color?: string;
};

const STATUS_APPEARANCE: Record<SpotStatus, StatusAppearance> = {
  under_review: { tone: 'warning', icon: 'time-outline', color: statusColors.warning },
  approved: { tone: 'good', icon: 'checkmark-circle', color: statusColors.good },
  rejected: { tone: 'bad', icon: 'close-circle', color: statusColors.bad },
  closed: { tone: 'neutral', icon: 'lock-closed-outline' },
};

export type SpotStatusBadgeProps = {
  status: SpotStatus;
  className?: string;
};

/**
 * A spot's moderation state as a pill, the counterpart to {@link ConditionBadge} for the
 * review queue rather than the equipment.
 */
export function SpotStatusBadge({ status, className }: SpotStatusBadgeProps) {
  const scheme = useScheme();
  const appearance = STATUS_APPEARANCE[status];

  return (
    <StatusChip
      className={className}
      icon={
        <Ionicons
          color={appearance.color ?? schemeTextSecondary[scheme]}
          name={appearance.icon}
          size={iconSizeValues.xs}
        />
      }
      label={SPOT_STATUS_LABEL[status]}
      tone={appearance.tone}
    />
  );
}
