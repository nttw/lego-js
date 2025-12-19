import { boolean, text, timestamp, uniqueIndex, pgTable } from "drizzle-orm/pg-core";

export const authUser = pgTable(
  "user",
  {
    id: text("id").primaryKey().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    emailVerified: boolean("emailVerified").notNull().default(false),
    image: text("image"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),

    // Username plugin
    username: text("username"),
    displayUsername: text("displayUsername"),

    // Admin plugin
    role: text("role"),
    banned: boolean("banned").default(false),
    banReason: text("banReason"),
    banExpires: timestamp("banExpires", { mode: "date" }),
  },
  (t) => [
    uniqueIndex("user_email_unique").on(t.email),
    uniqueIndex("user_username_unique").on(t.username),
    uniqueIndex("user_display_username_unique").on(t.displayUsername),
  ],
);

export const authSession = pgTable(
  "session",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("userId").notNull(),
    token: text("token").notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),

    // Admin plugin
    impersonatedBy: text("impersonatedBy"),
  },
  (t) => [uniqueIndex("session_token_unique").on(t.token)],
);

export const authAccount = pgTable(
  "account",
  {
    id: text("id").primaryKey().notNull(),
    userId: text("userId").notNull(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),

    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", { mode: "date" }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", { mode: "date" }),
    scope: text("scope"),
    idToken: text("idToken"),

    // Email/password auth stores scrypt hash here
    password: text("password"),

    createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("account_provider_account_unique").on(t.providerId, t.accountId)],
);

export const authVerification = pgTable(
  "verification",
  {
    id: text("id").primaryKey().notNull(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { mode: "date" }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
  },
  (t) => [uniqueIndex("verification_identifier_value_unique").on(t.identifier, t.value)],
);
