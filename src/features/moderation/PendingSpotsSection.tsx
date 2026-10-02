import { Text, View } from 'react-native';

import { Card, DangerButton, SecondaryButton, SectionHeader } from '@/components';
import type { ModerationSpot } from '@/features/moderation/moderation-api';
import { t } from '@/i18n';
import { formatMonthDayYear } from '@/utils/dates';

export type PendingSpotsSectionProps = {
  spots: readonly ModerationSpot[];
  /** The spot whose decision is in flight, so only its own buttons spin. */
  busySpotId: string | null;
  onApprove: (spot: ModerationSpot) => void;
  onOpenSpot: (spot: ModerationSpot) => void;
  onReject: (spot: ModerationSpot) => void;
};

/**
 * The submissions waiting for a decision, oldest first.
 *
 * Reports were the only thing the queue showed, which left submitted spots with no way to reach
 * the public: `status` starts at `pending` and only moderation can move it. This section is that
 * missing path — a moderator opens the spot to judge it, then approves or rejects it here.
 */
export function PendingSpotsSection({
  spots,
  busySpotId,
  onApprove,
  onOpenSpot,
  onReject,
}: PendingSpotsSectionProps) {
  if (spots.length === 0) {
    return null;
  }

  return (
    <View className="gap-space-12">
      <SectionHeader accent title={t('moderation.pendingTitle')} />

      {spots.map((spot) => {
        const busy = busySpotId === spot.id;

        return (
          <Card gap="md" key={spot.id} variant="outlined">
            <View className="gap-space-4">
              <Text className="font-semibold text-h3 text-text-primary" numberOfLines={2}>
                {spot.name}
              </Text>
              <Text className="font-regular text-caption text-text-muted">
                {t('moderation.submittedBy', { name: spot.ownerName })}
              </Text>
              <Text className="font-regular text-caption text-text-muted">
                {formatMonthDayYear(spot.createdAt)}
              </Text>
            </View>

            <View className="flex-row flex-wrap gap-space-8">
              <SecondaryButton
                label={t('moderation.approve')}
                loading={busy}
                onPress={() => onApprove(spot)}
                size="sm"
              />
              <DangerButton
                label={t('moderation.reject')}
                loading={busy}
                onPress={() => onReject(spot)}
                size="sm"
              />
              <SecondaryButton
                label={t('moderation.openSpot')}
                onPress={() => onOpenSpot(spot)}
                size="sm"
              />
            </View>
          </Card>
        );
      })}
    </View>
  );
}
