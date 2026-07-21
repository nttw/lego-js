interface CloudflareEnv {
  DB?: D1Database;
  CLOUDFLARE_DB_BACKEND?: "d1";
  DB_DIALECT?: "SQLITE";
  BETTER_AUTH_URL?: string;
  DOTENV_PRIVATE_KEY_PROD?: string;
}
