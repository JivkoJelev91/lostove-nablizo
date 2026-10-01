import { Text, View } from 'react-native';

import { SpotStatusBadge } from '@/components';
import type { SpotStatus } from '@/components';
import { cn } from '@/utils/cn';

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

const VIEWING_MESSAGE: Record<SpotStatus, string | undefined> = {
  under_review:
    'Only you can see this spot right now. It will appear in Nearby once a moderator approves it.',
  rejected:
    'A moderator did not approve this spot. Edit it to fix any issues, then submit it again.',
  closed: 'This spot is closed and no longer appears in the app.',
  approved: undefined,
};

const EDITING_MESSAGE: Record<SpotStatus, string> = {
  approved:
    'Saving submits this spot for review again. Until a moderator approves the changes, it will not appear in Nearby.',
  under_review: 'This spot is still waiting for approval. Saving keeps it in the review queue.',
  rejected: 'Saving submits this spot for review again.',
  closed: 'This spot is closed, so it can no longer be edited.',
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
  const message = context === 'editing' ? EDITING_MESSAGE[status] : VIEWING_MESSAGE[status];

  if (message === undefined) {
    return null;
  }

  return (
    <View
      className={cn(
        'gap-space-8 rounded-lg border border-border bg-surface-card p-card-pad',
        className,
      )}
    >
      <SpotStatusBadge status={status} />
      <Text className="text-bodySmall text-text-secondary">{message}</Text>
    </View>
  );
}
