import { getDatabase } from "./database";

export type LastPeriodStatus = "known" | "unknown";

export type InsertPeriodRecordPayload = {
  last_period_status: LastPeriodStatus;
  last_period_start_date: string | null;
};

export type LocalPeriodRecord = InsertPeriodRecordPayload & {
  id: number;
  user_id: string;
  isServerSynced: boolean;
  created_at: string;
};

type PeriodRecordRow = Omit<LocalPeriodRecord, "isServerSynced"> & {
  isServerSynced: number;
};

function mapPeriodRecord(row: PeriodRecordRow): LocalPeriodRecord {
  return {
    ...row,
    isServerSynced: row.isServerSynced === 1,
  };
}

function requireUserId(userId: string): string {
  const normalizedUserId = userId.trim();

  if (!normalizedUserId) {
    throw new Error("An authenticated user ID is required for local period records.");
  }

  return normalizedUserId;
}

export async function insertPeriodRecord(
  userId: string,
  payload: InsertPeriodRecordPayload,
): Promise<number> {
  const database = await getDatabase();
  const ownerId = requireUserId(userId);
  let insertedRecordId: number | null = null;

  await database.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      `DELETE FROM period_records
       WHERE user_id = ?
         AND isServerSynced = 0`,
      ownerId,
    );

    const result = await transaction.runAsync(
      `INSERT INTO period_records (
        user_id,
        last_period_status,
        last_period_start_date,
        isServerSynced,
        created_at
      ) VALUES (?, ?, ?, 0, ?)`,
      ownerId,
      payload.last_period_status,
      payload.last_period_start_date,
      new Date().toISOString(),
    );

    insertedRecordId = result.lastInsertRowId;
  });

  if (insertedRecordId === null) {
    throw new Error("The local period record could not be created.");
  }

  return insertedRecordId;
}

export async function markPeriodRecordAsSynced(
  id: number,
  userId: string,
): Promise<void> {
  const database = await getDatabase();
  const ownerId = requireUserId(userId);
  const result = await database.runAsync(
    `UPDATE period_records
     SET isServerSynced = 1
     WHERE id = ?
       AND user_id = ?`,
    id,
    ownerId,
  );

  if (result.changes !== 1) {
    throw new Error(`Expected to mark one period record as synced, updated ${result.changes}.`);
  }
}

export async function getUnsyncedPeriodRecords(
  userId: string,
): Promise<LocalPeriodRecord[]> {
  const database = await getDatabase();
  const ownerId = requireUserId(userId);
  const rows = await database.getAllAsync<PeriodRecordRow>(
    `SELECT
      id,
      user_id,
      last_period_status,
      last_period_start_date,
      isServerSynced,
      created_at
     FROM period_records
     WHERE user_id = ?
       AND isServerSynced = 0
     ORDER BY id ASC`,
    ownerId,
  );

  return rows.map(mapPeriodRecord);
}
