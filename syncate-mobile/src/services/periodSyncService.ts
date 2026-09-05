import {
  getUnsyncedPeriodRecords,
  markPeriodRecordAsSynced,
} from "@/database/periodRepository";
import { updateLastPeriodOnServer } from "@/services/cycleService";
import { getCurrentUserId } from "@/utils/currentUser";
import { getAccessToken } from "@/utils/tokenStorage";

export type PeriodSyncSummary = {
  attempted: number;
  synced: number;
  failed: number;
};

let activeAutomaticSync: Promise<PeriodSyncSummary | null> | null = null;

export async function retryUnsyncedPeriodRecords(): Promise<PeriodSyncSummary> {
  const userId = await getCurrentUserId();
  const records = await getUnsyncedPeriodRecords(userId);
  const summary: PeriodSyncSummary = {
    attempted: 0,
    synced: 0,
    failed: 0,
  };

  for (const record of records) {
    summary.attempted += 1;

    try {
      await updateLastPeriodOnServer({
        last_period_status: record.last_period_status,
        last_period_start_date: record.last_period_start_date,
      });
      await markPeriodRecordAsSynced(record.id, userId);
      summary.synced += 1;
    } catch {
      summary.failed += 1;
    }
  }

  return summary;
}

export function triggerAutomaticPeriodSync(): Promise<PeriodSyncSummary | null> {
  if (activeAutomaticSync) {
    return activeAutomaticSync;
  }

  activeAutomaticSync = (async () => {
    try {
      if (!(await getAccessToken())) {
        return null;
      }

      return await retryUnsyncedPeriodRecords();
    } catch {
      if (__DEV__) {
        console.warn("Automatic period synchronization failed.");
      }

      return null;
    }
  })().finally(() => {
    activeAutomaticSync = null;
  });

  return activeAutomaticSync;
}
