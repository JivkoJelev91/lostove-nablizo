import { useMemo, useState } from 'react';
import { FlatList, RefreshControl, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { EmptyState, ErrorState, GhostButton, LoadingSpinner, ScreenShell } from '@/components';
import { iconSizeValues, schemeTextMuted } from '@/constants/design-tokens';
import { RequireAuth } from '@/features/auth/RequireAuth';
import type { ModerationReport } from '@/features/moderation/moderation-api';
import { ModerationHeader } from '@/features/moderation/ModerationHeader';
import { ReportCard } from '@/features/moderation/ReportCard';
import { sortReports } from '@/features/moderation/sort-reports';
import {
  useDeleteSpotMutation,
  useIsModeratorQuery,
  useModerationReportsQuery,
  useModerateSpotMutation,
  usePendingSpotsQuery,
  useRejectedSpotsQuery,
  useSetReportStatusMutation,
} from '@/features/moderation/useModerationQuery';
import { useScheme } from '@/hooks/useScheme';
import { t } from '@/i18n';
import { goBackOrHome } from '@/utils/navigation';

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
  const pending = usePendingSpotsQuery();
  const rejected = useRejectedSpotsQuery();
  const moderateSpot = useModerateSpotMutation();
  const deleteSpot = useDeleteSpotMutation();
  const reportStatus = useSetReportStatusMutation();
  const [failed, setFailed] = useState<string | null>(null);

  const pendingSpots = pending.data ?? [];
  const rejectedSpots = rejected.data ?? [];
  const pendingBusyId = moderateSpot.isPending ? (moderateSpot.variables?.spotId ?? null) : null;
  const rejectedBusyId = deleteSpot.isPending ? (deleteSpot.variables ?? null) : null;

  const sorted = useMemo(() => sortReports(reports.data ?? []), [reports.data]);

  const run = async (action: Promise<unknown>) => {
    setFailed(null);

    try {
      await action;
    } catch (error: unknown) {
      // The raw message is shown under the translated line: this is an admin tool, and a
      // moderator chasing a failure needs what the server actually said.
      setFailed(error instanceof Error ? error.message : String(error));
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
          ) : reports.isLoading || pending.isLoading || rejected.isLoading ? (
            <View className="flex-1 items-center justify-center">
              <LoadingSpinner />
            </View>
          ) : pendingSpots.length > 0 || rejectedSpots.length > 0 ? null : (
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
          <ModerationHeader
            failed={failed}
            onApprove={(spot) =>
              void run(moderateSpot.mutateAsync({ spotId: spot.id, status: 'approved' }))
            }
            onDelete={(spot) => void run(deleteSpot.mutateAsync(spot.id))}
            onOpenSpot={(spot) => router.push({ pathname: '/spot/[id]', params: { id: spot.id } })}
            onReject={(spot) =>
              void run(moderateSpot.mutateAsync({ spotId: spot.id, status: 'rejected' }))
            }
            pending={pendingSpots}
            pendingBusyId={pendingBusyId}
            rejected={rejectedSpots}
            rejectedBusyId={rejectedBusyId}
          />
        }
        refreshControl={
          <RefreshControl
            onRefresh={() => {
              void reports.refetch();
              void pending.refetch();
              void rejected.refetch();
            }}
            refreshing={reports.isFetching || pending.isFetching || rejected.isFetching}
            tintColor={schemeTextMuted[scheme]}
          />
        }
        renderItem={renderReport}
      />
    </ScreenShell>
  );
}
