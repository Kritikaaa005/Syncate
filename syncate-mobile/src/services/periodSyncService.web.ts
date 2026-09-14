/**
 * Web-safe Period Sync adapter.
 *
 * Syncate's local period queue currently uses expo-sqlite on native devices.
 * The web build does not need to load that native/offline queue yet, and
 * importing expo-sqlite from an Expo Router web/static bundle can pull in the
 * wa-sqlite WASM worker. Keeping this platform adapter separate prevents the
 * web bundle from importing expo-sqlite at all while preserving the native
 * implementation in periodSyncService.ts for Android/iOS.
 */

export type PeriodSyncSummary = {
  attempted: number;
  synced: number;
  failed: number;
};

const EMPTY_SUMMARY: PeriodSyncSummary = {
  attempted: 0,
  synced: 0,
  failed: 0,
};

export async function retryUnsyncedPeriodRecords(): Promise<PeriodSyncSummary> {
  return EMPTY_SUMMARY;
}

export async function triggerAutomaticPeriodSync(): Promise<PeriodSyncSummary | null> {
  return null;
}
