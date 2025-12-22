import { spawnSync } from "node:child_process";

const dialect = process.argv[2];
if (dialect !== "sqlite" && dialect !== "pg") {
  console.error(
    "Usage: pnpm db:migrate:{sqlite|pg}\n" +
      "Example: pnpm db:migrate:sqlite\n" +
      "Example: pnpm db:migrate:pg",
  );
  process.exit(1);
}

const runDirect = dialect === "pg" && !!process.env.PG_DATABASE_URL;

const files =
  dialect === "pg"
    ? [".env.dev", ".env.staging"]
    : [".env.dev", ".env.local", ".env.prod", ".env.prod.local"];

const args = runDirect
  ? ["exec", "drizzle-kit", "migrate"]
  : [
      "exec",
      "dotenvx",
      "run",
      ...files.flatMap((f) => ["-f", f]),
      "--ignore=MISSING_ENV_FILE",
      "--",
      "drizzle-kit",
      "migrate",
    ];

const res = spawnSync("pnpm", args, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: {
    ...process.env,
    DB_DIALECT: dialect,
  },
});

process.exit(res.status ?? 1);
