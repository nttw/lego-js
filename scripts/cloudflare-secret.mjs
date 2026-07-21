import { spawnSync } from "node:child_process";

const environment = process.argv[2];
if (environment !== "d1") {
  throw new Error("Usage: node scripts/cloudflare-secret.mjs d1");
}

const privateKey = process.env.DOTENV_PRIVATE_KEY_PROD;
if (!privateKey) {
  throw new Error("DOTENV_PRIVATE_KEY_PROD is missing. Load the ignored .env.keys file first.");
}

const result = spawnSync(
  "pnpm",
  [
    "exec",
    "wrangler",
    "secret",
    "put",
    "DOTENV_PRIVATE_KEY_PROD",
    "--env",
    environment,
  ],
  {
    input: `${privateKey}\n`,
    stdio: ["pipe", "inherit", "inherit"],
  },
);

process.exit(result.status ?? 1);
