import { useMemo, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { router } from 'expo-router';

import {
  Card,
  DangerButton,
  EmptyState,
  GhostButton,
  LoadingSpinner,
  ScreenShell,
  StatusChip,
} from '@/components';
import type { StatusTone } from '@/components';
import { RequireAuth } from '@/features/auth/RequireAuth';
import type { ModerationReport, ReportStatus } from '@/features/moderation/moderation-api';
import {
  useIsModeratorQuery,
  useModerationReportsQuery,
  useModerateSpotMutation,
  useSetReportStatusMutation,
} from '@/features/moderation/useModerationQuery';
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

type ReportCardProps = {
  report: ModerationReport;
  busy: boolean;
  onOpenSpot: () => void;
  onEditSpot: () => void;
  onToggleSpot: () => void;
  onResolve: () => void;
  onDismiss: () => void;
};

/** One report: the claim, the spot it names, and every action the queue can take on it. */
function ReportCard({
  report,
  busy,
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
          <Text className="font-semibold text-h3 text-text-primary" numberOfLines={1}>
            {report.spotName}
          </Text>
          <Text className="text-bodySmall text-text-secondary">
            {reportReasonLabel(report.reason)}
          </Text>
          <Text className="text-caption text-text-muted">
            {t('moderation.reporter', { name: report.reporterName })}
          </Text>
        </View>

        <StatusChip label={t(STATUS_KEYS[report.status])} tone={STATUS_TONES[report.status]} />
      </View>

      {report.description.length === 0 ? null : (
        <Text className="text-bodySmall text-text-primary">{report.description}</Text>
      )}

      <Text className="text-caption text-text-muted">{formatMonthDayYear(report.createdAt)}</Text>

      <View className="flex-row flex-wrap gap-space-8">
        <GhostButton label={t('moderation.openSpot')} onPress={onOpenSpot} size="sm" />
        <GhostButton label={t('moderation.editSpot')} onPress={onEditSpot} size="sm" />

        {closed ? (
          <GhostButton label={t('moderation.reopenSpot')} onPress={onToggleSpot} size="sm" />
        ) : (
          <DangerButton
            label={t('moderation.closeSpot')}
            loading={busy}
            onPress={onToggleSpot}
            size="sm"
          />
        )}

        {report.status === 'open' ? (
          <>
            <GhostButton label={t('moderation.resolve')} onPress={onResolve} size="sm" />
            <GhostButton label={t('moderation.dismiss')} onPress={onDismiss} size="sm" />
          </>
        ) : null}
      </View>
    </Card>
  );
}

/**
 * The moderator queue: every report, open ones first, with the spot actions beside it.
 *
 * The screen is guarded twice, like the edit screen: `RequireAuth` needs an account, and the
 * database's own `is_moderator` answer decides whether the queue is even fetched. A signed-in
 * athlete who is not a moderator sees the same "no access" state as a stranger — the report list
 * is not something RLS would return to them anyway.
 */
export default function ModerationScreen() {
  return (
    <RequireAuth>
      <ModeratorQueue />
    </RequireAuth>
  );
}

function ModeratorQueue() {
  const moderator = useIsModeratorQuery();
  const reports = useModerationReportsQuery();
  const moderateSpot = useModerateSpotMutation();
  const reportStatus = useSetReportStatusMutation();
  const [failed, setFailed] = useState(false);

  const sorted = useMemo(
    () =>
      [...(reports.data ?? [])].sort((first, second) => {
        if (first.status !== second.status) {
          return first.status === 'open' ? -1 : 1;
        }

        return second.createdAt.getTime() - first.createdAt.getTime();
      }),
    [reports.data],
  );

  const run = async (action: Promise<unknown>) => {
    setFailed(false);

    try {
      await action;
    } catch {
      setFailed(true);
    }
  };

  if (moderator.isLoading) {
    return (
      <ScreenShell
        description={t('moderation.description')}
        title={t('moderation.title')}
        variant="tab"
      >
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </ScreenShell>
    );
  }

  if (moderator.data !== true) {
    return (
      <ScreenShell
        description={t('moderation.description')}
        title={t('moderation.title')}
        variant="tab"
      >
        <View className="flex-1 justify-center">
          <EmptyState
            description={t('moderation.noAccessDescription')}
            padded={false}
            title={t('moderation.noAccessTitle')}
          />
        </View>
      </ScreenShell>
    );
  }

  const renderReport = ({ item }: ListRenderItemInfo<ModerationReport>) => (
    <ReportCard
      busy={moderateSpot.isPending || reportStatus.isPending}
      onDismiss={() =>
        void run(reportStatus.mutateAsync({ reportId: item.id, status: 'dismissed' }))
      }
      onEditSpot={() => router.push({ pathname: '/spot/[id]/edit', params: { id: item.spotId } })}
      onOpenSpot={() => router.push({ pathname: '/spot/[id]', params: { id: item.spotId } })}
      onResolve={() =>
        void run(reportStatus.mutateAsync({ reportId: item.id, status: 'resolved' }))
      }
      onToggleSpot={() =>
        void run(
          moderateSpot.mutateAsync({
            spotId: item.spotId,
            status: item.spotStatus === 'closed' ? 'approved' : 'closed',
          }),
        )
      }
      report={item}
    />
  );

  return (
    <ScreenShell
      description={t('moderation.description')}
      title={t('moderation.title')}
      variant="tab"
    >
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-space-16 pb-section-gap-lg"
        data={sorted}
        keyExtractor={(report) => report.id}
        ListEmptyComponent={
          reports.isLoading ? (
            <View className="flex-1 items-center justify-center">
              <LoadingSpinner />
            </View>
          ) : (
            <EmptyState
              description={t('moderation.emptyDescription')}
              padded={false}
              title={t('moderation.emptyTitle')}
            />
          )
        }
        ListHeaderComponent={
          failed ? (
            <Text className="text-bodySmall text-status-bad">{t('moderation.failed')}</Text>
          ) : null
        }
        renderItem={renderReport}
      />
    </ScreenShell>
  );
}
