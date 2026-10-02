import type { SpotStatus } from '@/components';
import { toSpotStatus } from '@/features/spots/spots-mappers';
import { supabase } from '@/lib/supabase';

/** The states a report can be in; only moderation moves it out of `open`. */
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

/** One report as the moderator queue shows it: the claim, the spot and who filed it. */
export type ModerationReport = {
  id: string;
  reason: string;
  description: string;
  status: ReportStatus;
  createdAt: Date;
  spotId: string;
  spotName: string;
  spotStatus: SpotStatus;
  reporterName: string;
};

const REPORT_STATUSES: readonly ReportStatus[] = ['open', 'resolved', 'dismissed'];

/** Narrows the text column to a status the queue knows, defaulting to the untouched state. */
function toReportStatus(value: string): ReportStatus {
  return REPORT_STATUSES.find((status) => status === value) ?? 'open';
}

/** Whether the signed-in caller is a moderator, as the database answers it. */
export async function amIModerator(): Promise<boolean> {
  const { data, error } = await supabase.rpc('is_moderator');

  if (error) throw error;

  return data === true;
}

/**
 * Every report, newest first.
 *
 * RLS is what makes this the whole queue rather than one athlete's reports: the moderator select
 * policy is the only one that can see rows filed by other accounts, so the same query answers
 * empty for anyone else.
 */
export async function getModerationReports(): Promise<ModerationReport[]> {
  const { data, error } = await supabase
    .from('reports')
    .select(
      `
      id,
      reason,
      description,
      status,
      created_at,
      spot_id,
      spots ( id, name, status ),
      profiles ( username )
    `,
    )
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row) => ({
    id: row.id,
    reason: row.reason,
    description: row.description ?? '',
    status: toReportStatus(row.status),
    createdAt: new Date(row.created_at),
    spotId: row.spot_id,
    spotName: row.spots?.name ?? '—',
    spotStatus: toSpotStatus(row.spots?.status),
    reporterName: row.profiles?.username ?? '—',
  }));
}

/**
 * Moves a spot to a moderation state.
 *
 * A function rather than an update, because `spots.status` is in no column grant: it is the one
 * column an owner must never write, and `moderate_spot` checks the moderator table before it
 * touches the row.
 */
export async function moderateSpot(
  spotId: string,
  status: 'pending' | 'approved' | 'rejected' | 'closed',
): Promise<void> {
  const { error } = await supabase.rpc('moderate_spot', { p_spot_id: spotId, p_status: status });

  if (error) throw error;
}

/** Moves a report out of `open`, or back into it if a moderator reopens it. */
export async function setReportStatus(reportId: string, status: ReportStatus): Promise<void> {
  const { error } = await supabase.from('reports').update({ status }).eq('id', reportId);

  if (error) throw error;
}
