export type DbDialect = "sqlite" | "pg";

export function isNextBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

function normalizeDbDialect(value: string | undefined): DbDialect | undefined {
  if (!value) return undefined;
  const v = value.trim().toLowerCase();
  if (v === "pg" || v === "postgres" || v === "postgresql") return "pg";
  if (v === "sqlite" || v === "sqlite3") return "sqlite";
  return undefined;
}

/**
 * Runtime DB selection.
 *
 * Precedence:
 * - During `next build`, force SQLite in-memory to keep builds green.
 * - If `PG_DATABASE_URL` is set at runtime, use Postgres.
 * - Otherwise use SQLite (via `DATABASE_URL` or the default file).
 */
export function getDbDialect(): DbDialect {
  if (isNextBuildPhase()) return "sqlite";

  // Explicit override when both URLs are present (or to force one backend).
  const forced = normalizeDbDialect(process.env.DB_DIALECT);
  if (forced) return forced;

  // Default precedence: prefer Postgres when configured.
  if (process.env.PG_DATABASE_URL) return "pg";
  return "sqlite";
}

export function getSqliteDatabaseUrl(): string {
  return process.env.DATABASE_URL ?? "file:./data/lego.sqlite";
}

export function getPgDatabaseUrl(): string {
  const url = process.env.PG_DATABASE_URL;
  if (!url) {
    throw new Error("Missing required env var: PG_DATABASE_URL");
  }
  return url;
}
