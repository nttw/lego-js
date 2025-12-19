import Database from "better-sqlite3";
import type { Database as BetterSqliteDatabase } from "better-sqlite3";
import { Pool } from "pg";

import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";

import * as sqliteSchema from "./schema/sqlite";
import * as pgSchema from "./schema/pg";
import { getDbDialect, getPgDatabaseUrl, getSqliteDatabaseUrl, isNextBuildPhase } from "./runtime";

export const dbDialect = getDbDialect();

function getSqliteFilePath() {
  if (isNextBuildPhase()) {
    return ":memory:";
  }
  const url = getSqliteDatabaseUrl();
  return url.startsWith("file:") ? url.slice("file:".length) : url;
}

function getSqliteDatabase() {
  const globalKey = "__lego_sqlite_db__" as const;
  const globalForSqlite = globalThis as unknown as Record<
    typeof globalKey,
    BetterSqliteDatabase | undefined
  >;

  if (!globalForSqlite[globalKey]) {
    const sqlite = new Database(getSqliteFilePath());
    sqlite.pragma("busy_timeout = 5000");

    // Next.js `next build` can load route modules in multiple workers while collecting
    // page data. Setting WAL mode requires a write lock and can trigger SQLITE_BUSY.
    // WAL is optional for this app; we only enable it outside the build phase.
    if (!isNextBuildPhase()) {
      try {
        sqlite.pragma("journal_mode = WAL");
      } catch {
        // ignore
      }
    }

    globalForSqlite[globalKey] = sqlite;
  }

  return globalForSqlite[globalKey];
}

function getPgPool() {
  const globalKey = "__lego_pg_pool__" as const;
  const globalForPg = globalThis as unknown as Record<typeof globalKey, Pool | undefined>;

  if (!globalForPg[globalKey]) {
    globalForPg[globalKey] = new Pool({
      connectionString: getPgDatabaseUrl(),
      max: 10,
    });
  }

  return globalForPg[globalKey];
}

function createDb() {
  if (dbDialect === "pg") {
    const pool = getPgPool();
    return drizzlePg(pool, { schema: pgSchema });
  }

  const sqlite = getSqliteDatabase();
  return drizzleSqlite(sqlite, { schema: sqliteSchema });
}

// Drizzle returns dialect-specific database types (SQLite vs Postgres) with
// incompatible method generics. The app code doesn’t need those dialect-specific
// typings, so we intentionally erase them to keep a single `db` import usable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = createDb();
export type Db = typeof db;
