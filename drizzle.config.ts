import { defineConfig } from "drizzle-kit";
import { getDbDialect } from "./src/db/runtime";
import { getEnv, getRequiredEnv } from "./src/lib/env";

const runtimeDialect = getDbDialect();

export default defineConfig({
  schema: runtimeDialect === "pg" ? "./src/db/schema/pg/index.ts" : "./src/db/schema/sqlite.ts",
  out: runtimeDialect === "pg" ? "./drizzle/pg" : "./drizzle",
  dialect: runtimeDialect === "pg" ? "postgresql" : "sqlite",
  dbCredentials: {
    url:
      runtimeDialect === "pg"
        ? getRequiredEnv("PG_DATABASE_URL")
        : getEnv("DATABASE_URL") ?? "file:./data/lego.sqlite",
  },
});
