import { Text, View } from 'react-native';

import { Card, DangerButton, SecondaryButton, StatusChip } from '@/components';
import type { StatusTone } from '@/components';
import type { ModerationReport, ReportStatus } from '@/features/moderation/moderation-api';
import { reportReasonLabel } from '@/features/reports/report-reasons';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';
import { formatMonthDayYear } from '@/utils/dates';

const STATUS_TONES: Record<ReportStatus, StatusTone> = {
  open: 'warning',
  resolved: 'good',
  dismissed: 'neutral',
};

const STATUS_KEYS: Record<ReportStatus, TranslationKey> = {
  open: 'moderation.status.open',
  resolved: 'moderation.status.resolved',
  dismissed: 'moderation.status.dismissed',
};

export type ReportCardProps = {
  report: ModerationReport;
  /** Each action's own pending state: one report's write must not spin every card's buttons. */
  spotBusy: boolean;
  resolving: boolean;
  dismissing: boolean;
  onOpenSpot: () => void;
  onEditSpot: () => void;
  onToggleSpot: () => void;
  onResolve: () => void;
  onDismiss: () => void;
};

/** One report: the claim, the spot it names, and every action the queue can take on it. */
export function ReportCard({
  report,
  spotBusy,
  resolving,
  dismissing,
  onOpenSpot,
  onEditSpot,
  onToggleSpot,
  onResolve,
  onDismiss,
}: ReportCardProps) {
  const closed = report.spotStatus === 'closed';

  return (
    <Card gap="md" variant="outlined">
      <View className="flex-row items-start justify-between gap-space-8">
        <View className="flex-1 gap-space-4">
          <Text className="font-semibold text-h3 text-text-primary" numberOfLines={2}>
            {report.spotName}
          </Text>
          <Text className="font-regular text-bodySmall text-text-secondary">
            {reportReasonLabel(report.reason)}
          </Text>
          <Text className="font-medium text-caption text-text-muted">
            {t('moderation.reporter', { name: report.reporterName })}
          </Text>
        </View>

        <StatusChip label={t(STATUS_KEYS[report.status])} tone={STATUS_TONES[report.status]} />
      </View>

      {report.description.length === 0 ? null : (
        <Text className="font-regular text-bodySmall text-text-primary">{report.description}</Text>
      )}

      <Text className="font-medium text-caption text-text-muted">
        {formatMonthDayYear(report.createdAt)}
      </Text>

      <View className="flex-row flex-wrap gap-space-8">
        <SecondaryButton label={t('moderation.openSpot')} onPress={onOpenSpot} size="sm" />
        <SecondaryButton label={t('moderation.editSpot')} onPress={onEditSpot} size="sm" />

        {closed ? (
          <SecondaryButton
            label={t('moderation.reopenSpot')}
            loading={spotBusy}
            onPress={onToggleSpot}
            size="sm"
          />
        ) : (
          <DangerButton
            label={t('moderation.closeSpot')}
            loading={spotBusy}
            onPress={onToggleSpot}
            size="sm"
          />
        )}

        {report.status === 'open' ? (
          <>
            <SecondaryButton
              label={t('moderation.resolve')}
              loading={resolving}
              onPress={onResolve}
              size="sm"
            />
            <SecondaryButton
              label={t('moderation.dismiss')}
              loading={dismissing}
              onPress={onDismiss}
              size="sm"
            />
          </>
        ) : null}
      </View>
    </Card>
  );
}
