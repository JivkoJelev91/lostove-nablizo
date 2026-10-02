import { useState } from 'react';

import { Text, View } from 'react-native';

import {
  Card,
  DangerButton,
  GhostButton,
  Modal,
  SecondaryButton,
  SectionHeader,
} from '@/components';
import type { RejectedSpot } from '@/features/moderation/moderation-api';
import { t } from '@/i18n';
import { formatMonthDayYear } from '@/utils/dates';

export type RejectedSpotsSectionProps = {
  spots: readonly RejectedSpot[];
  /** The spot whose deletion is in flight, so only its own button spins. */
  busySpotId: string | null;
  onDelete: (spot: RejectedSpot) => void;
  onOpenSpot: (spot: RejectedSpot) => void;
};

/**
 * Rejected submissions, newest first, with the one action left for them: delete.
 *
 * A rejection is an answer, not a record worth keeping: the spot is invisible to the public and
 * its owner has seen the decision, so leaving the row forever only grows the table. Deleting asks
 * first, because the row takes its photos, reviews, favourites and reports with it and none of
 * that can be undone.
 */
export function RejectedSpotsSection({
  spots,
  busySpotId,
  onDelete,
  onOpenSpot,
}: RejectedSpotsSectionProps) {
  const [confirming, setConfirming] = useState<RejectedSpot | null>(null);

  if (spots.length === 0) {
    return null;
  }

  const confirmDelete = () => {
    const spot = confirming;
    setConfirming(null);

    if (spot !== null) {
      onDelete(spot);
    }
  };

  return (
    <View className="gap-space-12">
      <SectionHeader accent title={t('moderation.rejectedTitle')} />

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
                label={t('moderation.openSpot')}
                onPress={() => onOpenSpot(spot)}
                size="sm"
              />
              <DangerButton
                label={t('moderation.deleteSpot')}
                loading={busy}
                onPress={() => setConfirming(spot)}
                size="sm"
              />
            </View>
          </Card>
        );
      })}

      <Modal
        actions={
          <>
            <GhostButton label={t('common.cancel')} onPress={() => setConfirming(null)} />
            <DangerButton label={t('moderation.deleteConfirm')} onPress={confirmDelete} />
          </>
        }
        description={t('moderation.deleteDescription', { name: confirming?.name ?? '' })}
        onClose={() => setConfirming(null)}
        title={t('moderation.deleteTitle')}
        visible={confirming !== null}
      />
    </View>
  );
}
