import Link from "next/link";

import { getEnv } from "@/lib/env";
import { getDbDialect } from "@/db/runtime";

export default async function EnvPage() {
  const hello = getEnv("HELLO");
  const dbDialect = getDbDialect();
  const dbDialectEnv = getEnv("DB_DIALECT");
  const hasPgDatabaseUrl = Boolean(getEnv("PG_DATABASE_URL"));
  const hasSqliteDatabaseUrl = Boolean(getEnv("DATABASE_URL"));

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div>
        <p className="text-sm opacity-70">
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
        </p>
        <h1 className="mt-1 text-2xl font-semibold">Environment</h1>
        <p className="mt-1 text-sm opacity-80">Server-side value of HELLO</p>
      </div>

      <section className="mt-6">
        <div className="rounded-md border border-black/20 p-3 dark:border-white/15">
          <div className="text-sm opacity-70">HELLO</div>
          <div className="mt-1 break-all font-mono text-sm">{hello ?? "(missing)"}</div>
        </div>

        <div className="mt-4 rounded-md border border-black/20 p-3 dark:border-white/15">
          <div className="text-sm opacity-70">DB</div>
          <div className="mt-1 grid gap-2 text-sm">
            <div>
              <span className="opacity-70">Selected dialect:</span>{" "}
              <span className="font-mono">{dbDialect}</span>
            </div>
            <div>
              <span className="opacity-70">DB_DIALECT env:</span>{" "}
              <span className="font-mono">{dbDialectEnv ?? "(unset)"}</span>
            </div>
            <div>
              <span className="opacity-70">PG_DATABASE_URL present:</span>{" "}
              <span className="font-mono">{String(hasPgDatabaseUrl)}</span>
            </div>
            <div>
              <span className="opacity-70">DATABASE_URL present:</span>{" "}
              <span className="font-mono">{String(hasSqliteDatabaseUrl)}</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
