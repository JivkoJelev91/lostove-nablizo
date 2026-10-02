import type { ModerationReport } from '@/features/moderation/moderation-api';

/** Open reports first, then newest first within each state, for the queue's reading order. */
export function sortReports(reports: readonly ModerationReport[]): ModerationReport[] {
  return [...reports].sort((first, second) => {
    if (first.status !== second.status) {
      return first.status === 'open' ? -1 : 1;
    }

    return second.createdAt.getTime() - first.createdAt.getTime();
  });
}
