import Database from "better-sqlite3";
import type { Database as BetterSqliteDatabase } from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migrateSqlite } from "drizzle-orm/better-sqlite3/migrator";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";

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
    console.log("Creating new Postgres pool");
    globalForPg[globalKey] = new Pool({
      connectionString: getPgDatabaseUrl(),
      max: 10,
    });
    console.log("Created new Postgres pool: ", globalForPg[globalKey]);
  }

  return globalForPg[globalKey];
}

type SqliteDb = ReturnType<typeof drizzleSqlite<typeof sqliteSchema>>;
type PgDb = ReturnType<typeof drizzlePg<typeof pgSchema>>;
type DbInternal = SqliteDb | PgDb;

function getMigrationsFolder(): string {
  const rel = dbDialect === "pg" ? "drizzle/pg" : "drizzle";
  return path.resolve(process.cwd(), rel);
}

async function isDbEmpty(): Promise<boolean> {
  if (dbDialect === "pg") {
    const pool = getPgPool();
    const res = await pool.query(
      "select tablename from pg_catalog.pg_tables where schemaname = 'public' limit 1;",
    );
    return res.rowCount === 0;
  }

  const sqlite = getSqliteDatabase();
  const row = sqlite
    .prepare(
      "select name from sqlite_master where type = 'table' and name not like 'sqlite_%' limit 1;",
    )
    .get();
  return !row;
}

async function migrateDbIfEmpty(db: DbInternal): Promise<void> {
  if (isNextBuildPhase()) return;

  const migrationsFolder = getMigrationsFolder();
  if (!fs.existsSync(migrationsFolder)) {
    throw new Error(
      `Missing migrations folder at ${migrationsFolder}. Run \\"pnpm db:generate\\" for this dialect and commit the generated migrations.`,
    );
  }

  let empty = false;
  try {
    empty = await isDbEmpty();
  } catch {
    // If we can't check emptiness reliably, do not auto-migrate.
    // This avoids surprising writes when connectivity/permissions are unclear.
    return;
  }

  if (!empty) return;

  if (dbDialect === "pg") {
    await migratePg(db as PgDb, { migrationsFolder });
    return;
  }

  await migrateSqlite(db as SqliteDb, { migrationsFolder });
}

function createDbSync(): DbInternal {
  if (dbDialect === "pg") {
    const pool = getPgPool();
    return drizzlePg(pool, { schema: pgSchema });
  }

  const sqlite = getSqliteDatabase();
  return drizzleSqlite(sqlite, { schema: sqliteSchema });
}

async function getDbSingleton(): Promise<DbInternal> {
  const globalKey = "__lego_db_singleton__" as const;
  const globalForDb = globalThis as unknown as Record<typeof globalKey, Promise<Db> | undefined>;

  if (!globalForDb[globalKey]) {
    globalForDb[globalKey] = (async () => {
      const created = createDbSync();
      await migrateDbIfEmpty(created);
      return created;
    })();
  }

  return globalForDb[globalKey];
}

// Drizzle returns dialect-specific database types (SQLite vs Postgres) with
// incompatible method generics. The app code doesn’t need those dialect-specific
// typings, so we intentionally erase them to keep a single `db` import usable.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const db: any = await getDbSingleton();
export type Db = typeof db;

// Export for tests / scripts that want to trigger the same behavior.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createDb(): Promise<any> {
  return getDbSingleton();
}
