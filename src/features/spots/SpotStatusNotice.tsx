import { Text } from 'react-native';

import { Card, SpotStatusBadge } from '@/components';
import type { SpotStatus } from '@/components';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';

export type SpotStatusNoticeProps = {
  status: SpotStatus;
  /**
   * `viewing` explains what the state means for the spot page; `editing` explains what saving
   * the form will do to it. The approved state only needs the second: an owner looking at an
   * approved spot has nothing to be told.
   */
  context?: 'viewing' | 'editing';
  className?: string;
};

const VIEWING_MESSAGE: Partial<Record<SpotStatus, TranslationKey>> = {
  under_review: 'status.underReviewViewing',
  rejected: 'status.rejectedViewing',
  closed: 'status.closedViewing',
};

const EDITING_MESSAGE: Record<SpotStatus, TranslationKey> = {
  approved: 'status.approvedEditing',
  under_review: 'status.underReviewEditing',
  rejected: 'status.rejectedEditing',
  closed: 'status.closedEditing',
};

/**
 * The moderation state of an owned spot, spelled out.
 *
 * A status chip alone tells the owner what happened but not what it means for them, so this
 * pairs the chip with one sentence: who can see the spot now, and what the next action does.
 */
export function SpotStatusNotice({
  status,
  context = 'viewing',
  className,
}: SpotStatusNoticeProps) {
  const messageKey = context === 'editing' ? EDITING_MESSAGE[status] : VIEWING_MESSAGE[status];

  if (messageKey === undefined) {
    return null;
  }

  return (
    <Card className={className} gap="md" variant="flat">
      <SpotStatusBadge status={status} />
      <Text className="font-regular text-bodySmall text-text-secondary">{t(messageKey)}</Text>
    </Card>
  );
}
