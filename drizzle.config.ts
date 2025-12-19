import { defineConfig } from "drizzle-kit";
import { getDbDialect } from "./src/db/runtime";

const runtimeDialect = getDbDialect();

export default defineConfig({
  schema: runtimeDialect === "pg" ? "./src/db/schema/pg/index.ts" : "./src/db/schema/sqlite.ts",
  out: runtimeDialect === "pg" ? "./drizzle/pg" : "./drizzle",
  dialect: runtimeDialect === "pg" ? "postgresql" : "sqlite",
  dbCredentials: {
    url:
      runtimeDialect === "pg"
        ? (process.env.PG_DATABASE_URL as string)
        : process.env.DATABASE_URL ?? "file:./data/lego.sqlite",
  },
});
