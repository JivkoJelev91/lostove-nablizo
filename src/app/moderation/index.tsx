import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, Text, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import {
  Card,
  DangerButton,
  EmptyState,
  ErrorState,
  GhostButton,
  LoadingSpinner,
  ScreenShell,
  SecondaryButton,
  StatusChip,
} from '@/components';
import type { StatusTone } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { RequireAuth } from '@/features/auth/RequireAuth';
import type { ModerationReport, ReportStatus } from '@/features/moderation/moderation-api';
import {
  useIsModeratorQuery,
  useModerationReportsQuery,
  useModerateSpotMutation,
  useSetReportStatusMutation,
} from '@/features/moderation/useModerationQuery';
import { reportReasonLabel } from '@/features/reports/report-reasons';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import type { TranslationKey } from '@/i18n';
import { formatMonthDayYear } from '@/utils/dates';
import { goBackOrHome } from '@/utils/navigation';

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
function ReportCard({
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
        <GhostButton label={t('moderation.openSpot')} onPress={onOpenSpot} size="sm" />
        <GhostButton label={t('moderation.editSpot')} onPress={onEditSpot} size="sm" />

        {closed ? (
          <GhostButton
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
            <GhostButton
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
  const scheme = useScheme();
  const moderator = useIsModeratorQuery();

  if (moderator.isLoading) {
    return (
      <ScreenShell
        description={t('moderation.description')}
        title={t('moderation.title')}
        variant="stack"
      >
        <View className="flex-1 items-center justify-center">
          <LoadingSpinner />
        </View>
      </ScreenShell>
    );
  }

  // A failed check is not a refusal: an offline moderator must not be told they lack access.
  if (moderator.isError) {
    return (
      <ScreenShell
        description={t('moderation.description')}
        title={t('moderation.title')}
        variant="stack"
      >
        <View className="flex-1 justify-center">
          <ErrorState onRetry={() => void moderator.refetch()} />
        </View>
      </ScreenShell>
    );
  }

  if (moderator.data !== true) {
    return (
      <ScreenShell
        description={t('moderation.description')}
        title={t('moderation.title')}
        variant="stack"
      >
        <View className="flex-1 justify-center">
          <EmptyState
            action={<GhostButton label={t('common.back')} onPress={goBackOrHome} />}
            description={t('moderation.noAccessDescription')}
            icon={
              <Ionicons
                color={schemeTextMuted[scheme]}
                name="lock-closed-outline"
                size={iconSizeValues.lg}
              />
            }
            padded={false}
            title={t('moderation.noAccessTitle')}
          />
        </View>
      </ScreenShell>
    );
  }

  return <ReportQueue />;
}

/** The queue itself, rendered only once the moderator check has said yes. */
function ReportQueue() {
  const scheme = useScheme();
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

  const renderReport = ({ item }: ListRenderItemInfo<ModerationReport>) => {
    const statusVariables = reportStatus.isPending ? reportStatus.variables : undefined;

    return (
      <ReportCard
        dismissing={statusVariables?.reportId === item.id && statusVariables.status === 'dismissed'}
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
        resolving={statusVariables?.reportId === item.id && statusVariables.status === 'resolved'}
        spotBusy={moderateSpot.isPending && moderateSpot.variables?.spotId === item.spotId}
      />
    );
  };

  return (
    <ScreenShell
      description={t('moderation.description')}
      title={t('moderation.title')}
      variant="stack"
    >
      <FlatList
        className="flex-1"
        contentContainerClassName="gap-list-gap pb-section-gap-lg"
        data={sorted}
        keyExtractor={(report) => report.id}
        ListEmptyComponent={
          reports.isError ? (
            <View className="flex-1 justify-center">
              <ErrorState onRetry={() => void reports.refetch()} />
            </View>
          ) : reports.isLoading ? (
            <View className="flex-1 items-center justify-center">
              <LoadingSpinner />
            </View>
          ) : (
            <View className="flex-1 justify-center">
              <EmptyState
                description={t('moderation.emptyDescription')}
                icon={
                  <Ionicons
                    color={schemeTextMuted[scheme]}
                    name="checkmark-circle-outline"
                    size={iconSizeValues.lg}
                  />
                }
                padded={false}
                title={t('moderation.emptyTitle')}
              />
            </View>
          )
        }
        ListHeaderComponent={
          failed ? (
            <Text className="font-regular text-bodySmall text-status-bad">
              {t('moderation.failed')}
            </Text>
          ) : null
        }
        refreshControl={
          <RefreshControl
            onRefresh={() => void reports.refetch()}
            refreshing={reports.isFetching}
            tintColor={schemeTextMuted[scheme]}
          />
        }
        renderItem={renderReport}
      />
    </ScreenShell>
  );
}
