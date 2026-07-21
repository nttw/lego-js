import Database from "better-sqlite3";
import type { Database as BetterSqliteDatabase } from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import { Pool } from "pg";

import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { migrate as migrateSqlite } from "drizzle-orm/better-sqlite3/migrator";
import { drizzle as drizzlePg } from "drizzle-orm/node-postgres";
import { migrate as migratePg } from "drizzle-orm/node-postgres/migrator";

import * as pgSchema from "./schema/pg";
import * as sqliteSchema from "./schema/sqlite";
import { getDbDialect, getPgDatabaseUrl, getSqliteDatabaseUrl, isNextBuildPhase } from "./runtime";

function getSqliteFilePath() {
  if (isNextBuildPhase()) return ":memory:";
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

    if (!isNextBuildPhase()) {
      try {
        sqlite.pragma("journal_mode = WAL");
      } catch {
        // WAL is an optimization, not a startup requirement.
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

type SqliteDb = ReturnType<typeof drizzleSqlite<typeof sqliteSchema>>;
type PgDb = ReturnType<typeof drizzlePg<typeof pgSchema>>;
type NodeDb = SqliteDb | PgDb;

function getMigrationsFolder(): string {
  return path.resolve(
    /* turbopackIgnore: true */ process.cwd(),
    getDbDialect() === "pg" ? "drizzle/pg" : "drizzle",
  );
}

async function isDbEmpty(): Promise<boolean> {
  if (getDbDialect() === "pg") {
    const result = await getPgPool().query(
      "select tablename from pg_catalog.pg_tables where schemaname = 'public' limit 1;",
    );
    return result.rowCount === 0;
  }

  const row = getSqliteDatabase()
    .prepare(
      "select name from sqlite_master where type = 'table' and name not like 'sqlite_%' limit 1;",
    )
    .get();
  return !row;
}

async function migrateDbIfEmpty(db: NodeDb): Promise<void> {
  if (isNextBuildPhase()) return;

  const migrationsFolder = getMigrationsFolder();
  if (!fs.existsSync(migrationsFolder)) {
    throw new Error(
      `Missing migrations folder at ${migrationsFolder}. Run "pnpm db:generate" for this dialect and commit the generated migrations.`,
    );
  }

  let empty = false;
  try {
    empty = await isDbEmpty();
  } catch {
    // A connectivity failure must not turn into an unexpected migration write.
    return;
  }

  if (!empty) return;

  if (getDbDialect() === "pg") {
    await migratePg(db as PgDb, { migrationsFolder });
  } else {
    await migrateSqlite(db as SqliteDb, { migrationsFolder });
  }
}

function createNodeDb(): NodeDb {
  if (getDbDialect() === "pg") {
    return drizzlePg(getPgPool(), { schema: pgSchema });
  }

  return drizzleSqlite(getSqliteDatabase(), { schema: sqliteSchema });
}

export async function getNodeDb(): Promise<NodeDb> {
  const globalKey = "__lego_db_singleton__" as const;
  const globalForDb = globalThis as unknown as Record<
    typeof globalKey,
    Promise<NodeDb> | undefined
  >;

  if (!globalForDb[globalKey]) {
    globalForDb[globalKey] = (async () => {
      const db = createNodeDb();
      await migrateDbIfEmpty(db);
      return db;
    })();
  }

  return globalForDb[globalKey];
}
