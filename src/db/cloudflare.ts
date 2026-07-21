import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle as drizzleD1 } from "drizzle-orm/d1";

import * as sqliteSchema from "./schema/sqlite";

export function getCloudflareDb() {
  const { env } = getCloudflareContext();
  if (!env.DB) throw new Error("Missing Cloudflare D1 binding: DB");
  return drizzleD1(env.DB, { schema: sqliteSchema });
}
