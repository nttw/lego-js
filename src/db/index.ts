import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";

import * as schema from "./schema";

function getSqliteFilePath() {
  if (process.env.NEXT_PHASE === "phase-production-build") {
    return ":memory:";
  }
  const url = process.env.DATABASE_URL ?? "file:./data/lego.sqlite";
  return url.startsWith("file:") ? url.slice("file:".length) : url;
}

const sqlite = new Database(getSqliteFilePath());
sqlite.pragma("busy_timeout = 5000");

// Next.js `next build` can load route modules in multiple workers while collecting
// page data. Setting WAL mode requires a write lock and can trigger SQLITE_BUSY.
// WAL is optional for this app; we only enable it outside the build phase.
if (process.env.NEXT_PHASE !== "phase-production-build") {
  try {
    sqlite.pragma("journal_mode = WAL");
  } catch {
    // ignore
  }
}

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;
