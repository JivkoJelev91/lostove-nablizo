import { Text, View } from 'react-native';

import type { ModerationSpot } from '@/features/moderation/moderation-api';
import { PendingSpotsSection } from '@/features/moderation/PendingSpotsSection';
import { RejectedSpotsSection } from '@/features/moderation/RejectedSpotsSection';
import { t } from '@/i18n';

export type ModerationHeaderProps = {
  pending: readonly ModerationSpot[];
  rejected: readonly ModerationSpot[];
  failed: boolean;
  pendingBusyId: string | null;
  rejectedBusyId: string | null;
  onApprove: (spot: ModerationSpot) => void;
  onDelete: (spot: ModerationSpot) => void;
  onOpenSpot: (spot: ModerationSpot) => void;
  onReject: (spot: ModerationSpot) => void;
};

/** The queue's top matter: submissions to decide on, rejections to clean up, and the last failure. */
export function ModerationHeader({
  pending,
  rejected,
  failed,
  pendingBusyId,
  rejectedBusyId,
  onApprove,
  onDelete,
  onOpenSpot,
  onReject,
}: ModerationHeaderProps) {
  return (
    <View className="gap-space-16">
      <PendingSpotsSection
        busySpotId={pendingBusyId}
        onApprove={onApprove}
        onOpenSpot={onOpenSpot}
        onReject={onReject}
        spots={pending}
      />

      <RejectedSpotsSection
        busySpotId={rejectedBusyId}
        onDelete={onDelete}
        onOpenSpot={onOpenSpot}
        spots={rejected}
      />

      {failed ? (
        <Text className="font-regular text-bodySmall text-status-bad">
          {t('moderation.failed')}
        </Text>
      ) : null}
    </View>
  );
}
