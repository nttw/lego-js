import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";

import { db } from "@/db";
import { dbDialect } from "@/db";
import { getEnv, getRequiredEnv } from "@/lib/env";
import {
  authAccount,
  authSession,
  authUser,
  authVerification,
} from "@/db/schema";
import { sql } from "drizzle-orm";

const inferredBaseUrlFromVercel = (() => {
  const vercelUrl = getEnv("VERCEL_URL");
  if (!vercelUrl) return undefined;
  // Vercel provides a hostname without scheme.
  return `https://${vercelUrl}`;
})();

export const auth = betterAuth({
  secret: getRequiredEnv("BETTER_AUTH_SECRET", {
    allowDuringBuild: true,
    buildFallback: "__BUILD_TIME_SECRET__0123456789012345678901234567__",
  }),
  baseURL:
    getEnv("BETTER_AUTH_URL") ??
    inferredBaseUrlFromVercel ??
    getRequiredEnv("BETTER_AUTH_URL", {
      allowDuringBuild: true,
      buildFallback: "http://localhost:3000",
    }),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const rows = await db
            .select({ count: sql<number>`count(*)` })
            .from(authUser);
          const isFirstUser = (rows[0]?.count ?? 0) === 0;
          const requestedRole = (user as unknown as { role?: string }).role;

          return {
            data: {
              ...user,
              role: isFirstUser ? "admin" : requestedRole ?? "user",
            },
          };
        },
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: dbDialect === "pg" ? "pg" : "sqlite",
    // Better Auth expects schema keys like "user"/"session"/...; our Drizzle exports
    // are named authUser/authSession/etc, so we map them explicitly.
    schema: {
      user: authUser,
      session: authSession,
      account: authAccount,
      verification: authVerification,
    },
  }),
  plugins: [
    admin(),
    username(),
    // Must be last to allow server actions to set cookies.
    nextCookies(),
  ],
});
