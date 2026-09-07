import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "syncate.db";

type TableInfoRow = {
  name: string;
};

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;
let initializationPromise: Promise<SQLite.SQLiteDatabase> | null = null;

function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME);
  }

  return databasePromise;
}

export function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!initializationPromise) {
    initializationPromise = openDatabase().then(async (database) => {
      await database.execAsync(`
        CREATE TABLE IF NOT EXISTS period_records (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          last_period_status TEXT NOT NULL,
          last_period_start_date TEXT NULL,
          isServerSynced INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL
        );
      `);

      const columns = await database.getAllAsync<TableInfoRow>(
        "PRAGMA table_info(period_records)",
      );

      if (!columns.some((column) => column.name === "user_id")) {
        // Existing rows predate account scoping. Keep them unowned so they can
        // never be selected by a user-scoped synchronization query.
        await database.execAsync(
          "ALTER TABLE period_records ADD COLUMN user_id TEXT NULL",
        );
      }

      return database;
    });
  }

  return initializationPromise;
}

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  return initializeDatabase();
}
