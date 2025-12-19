import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const authUser = sqliteTable(
  "user",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: integer("emailVerified", { mode: "boolean" })
      .notNull()
      .default(false),
    image: text("image"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),

    // Username plugin
    username: text("username"),
    displayUsername: text("displayUsername"),

    // Admin plugin
    role: text("role"),
    banned: integer("banned", { mode: "boolean" }).default(false),
    banReason: text("banReason"),
    banExpires: integer("banExpires", { mode: "timestamp_ms" }),
  },
  (t) => [
    uniqueIndex("user_email_unique").on(t.email),
    uniqueIndex("user_username_unique").on(t.username),
    uniqueIndex("user_display_username_unique").on(t.displayUsername),
  ],
);

export const authSession = sqliteTable(
  "session",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("userId").notNull(),
    token: text("token").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),

    // Admin plugin
    impersonatedBy: text("impersonatedBy"),
  },
  (t) => [uniqueIndex("session_token_unique").on(t.token)],
);

export const authAccount = sqliteTable(
  "account",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("userId").notNull(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),

    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp_ms" }),
    refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp_ms" }),
    scope: text("scope"),
    idToken: text("idToken"),

    // Email/password auth stores scrypt hash here
    password: text("password"),

    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("account_provider_account_unique").on(t.providerId, t.accountId)],
);

export const authVerification = sqliteTable(
  "verification",
  {
    id: text("id").primaryKey().notNull(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expiresAt", { mode: "timestamp_ms" }).notNull(),
    createdAt: integer("createdAt", { mode: "timestamp_ms" }).notNull(),
    updatedAt: integer("updatedAt", { mode: "timestamp_ms" }).notNull(),
  },
  (t) => [uniqueIndex("verification_identifier_value_unique").on(t.identifier, t.value)],
);
