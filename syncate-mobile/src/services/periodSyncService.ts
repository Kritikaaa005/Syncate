import {
  getUnsyncedPeriodRecords,
  markPeriodRecordAsSynced,
} from "@/database/periodRepository";

import {
  getPeriodLogs,
  logPeriod,
} from "@/services/cycleService";

import { getCurrentUserId } from "@/utils/currentUser";
import { getAccessToken } from "@/utils/tokenStorage";


export type PeriodSyncSummary = {
  attempted: number;
  synced: number;
  failed: number;
};


let activeAutomaticSync:
  Promise<PeriodSyncSummary | null> | null =
  null;


export async function retryUnsyncedPeriodRecords():
  Promise<PeriodSyncSummary> {

  const userId =
    await getCurrentUserId();

  const records =
    await getUnsyncedPeriodRecords(
      userId
    );

  const summary: PeriodSyncSummary = {
    attempted: 0,
    synced: 0,
    failed: 0,
  };

  let serverPeriodStartDates:
    Set<string> | null = null;


  for (const record of records) {
    summary.attempted += 1;

    try {
      /*
       * The current backend no longer stores an
       * "unknown last period" record.
       *
       * If the user chose "I don't know", there is
       * intentionally nothing to submit to the
       * server, so the local record can be considered
       * handled.
       */
      if (
        record.last_period_status ===
        "unknown"
      ) {
        await markPeriodRecordAsSynced(
          record.id,
          userId
        );

        summary.synced += 1;
        continue;
      }


      const startDate =
        record.last_period_start_date;

      /*
       * A known period must have a date.
       * Leave malformed records unsynced so they
       * are not silently discarded.
       */
      if (!startDate) {
        summary.failed += 1;
        continue;
      }


      /*
       * Load existing server periods once.
       *
       * This also protects against duplicate POSTs:
       * if an earlier request reached the server but
       * the app failed before marking SQLite synced,
       * the retry will notice that the same period
       * already exists.
       */
      if (!serverPeriodStartDates) {
        const serverPeriods =
          await getPeriodLogs();

        serverPeriodStartDates =
          new Set(
            serverPeriods.map(
              (period) =>
                period.start_date
            )
          );
      }


      if (
        !serverPeriodStartDates.has(
          startDate
        )
      ) {
        await logPeriod({
          start_date: startDate,
        });

        serverPeriodStartDates.add(
          startDate
        );
      }


      await markPeriodRecordAsSynced(
        record.id,
        userId
      );

      summary.synced += 1;

    } catch {
      summary.failed += 1;
    }
  }


  return summary;
}


export function triggerAutomaticPeriodSync():
  Promise<PeriodSyncSummary | null> {

  if (activeAutomaticSync) {
    return activeAutomaticSync;
  }


  activeAutomaticSync = (
    async () => {
      try {
        if (!(await getAccessToken())) {
          return null;
        }

        return await retryUnsyncedPeriodRecords();

      } catch {
        if (__DEV__) {
          console.warn(
            "Automatic period synchronization failed."
          );
        }

        return null;
      }
    }
  )().finally(() => {
    activeAutomaticSync = null;
  });


  return activeAutomaticSync;
}