import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, username } from "better-auth/plugins";

import { db } from "@/db";
import { requiredEnv } from "@/lib/env";
import { authUser } from "@/db/schema";
import { sql } from "drizzle-orm";

export const auth = betterAuth({
  secret: requiredEnv("BETTER_AUTH_SECRET", {
    allowDuringBuild: true,
    buildFallback: "__BUILD_TIME_SECRET__0123456789012345678901234567__",
  }),
  baseURL: requiredEnv("BETTER_AUTH_URL", {
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

          return {
            data: {
              ...user,
              role: isFirstUser ? "admin" : (user as any).role ?? "user",
            },
          };
        },
      },
    },
  },
  database: drizzleAdapter(db, {
    provider: "sqlite",
  }),
  plugins: [
    admin(),
    username(),
    // Must be last to allow server actions to set cookies.
    nextCookies(),
  ],
});
