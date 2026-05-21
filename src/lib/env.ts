/**
 * DO NOT remove uncommented code, left for future investigation
 */

type RequiredEnvOptions = {
  /**
   * Next.js imports server modules during `next build` to collect route/page data.
   * Allowing a build-time fallback keeps builds green without weakening runtime checks.
   */
  allowDuringBuild?: boolean;
  buildFallback?: string;
};

let dotenvxConfigured = false;
let dotenvxGet:
  | undefined
  | ((key: string) => string | undefined);

/**
 * Reads an environment variable.
 *
 * Default behavior is to prefer `process.env` (works with `dotenvx run ...`).
 * If missing, we fall back to `dotenvx.get()` (decrypt-at-access) when available.
 */
export function getEnv(name: string): string | undefined {
  const fromProcess = process.env[name];
  if (fromProcess && fromProcess.length > 0) {
    if (!fromProcess.startsWith("encrypted:")) return fromProcess;

    // If we already have an encrypted value in-process, we can try decrypt-at-access.
    ensureDotenvxLoaded();
    if (dotenvxGet) {
      try {
        const decrypted = dotenvxGet(name);
        if (decrypted && decrypted.length > 0) return decrypted;
      } catch {
        // ignore
      }
    }

    return fromProcess;
  }

  // Missing from process.env: attempt to load from encrypted env files.
  ensureDotenvxLoaded();
  const afterLoad = process.env[name];
  if (afterLoad && afterLoad.length > 0) {
    if (!afterLoad.startsWith("encrypted:")) return afterLoad;
    if (dotenvxGet) {
      try {
        const decrypted = dotenvxGet(name);
        if (decrypted && decrypted.length > 0) return decrypted;
      } catch {
        // ignore
      }
    }
    return afterLoad;
  }

  return undefined;
}

function ensureDotenvxLoaded() {
  if (dotenvxConfigured) return;
  dotenvxConfigured = true;

  // Only attempt file-based env loading in Node-like server runtimes.
  // If this runs in an Edge runtime, dotenvx may throw (fs not available).
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const dotenvx = require("@dotenvx/dotenvx") as {
      config: (options?: unknown) => unknown;
      get?: (key: string) => string | undefined;
    };
    dotenvxGet = dotenvx.get;

    // Map your environment-specific keys to the generic key dotenvx expects.
    const mappedPrivateKey =
      process.env.DOTENV_PRIVATE_KEY ??
      process.env.DOTENV_PRIVATE_KEY_PROD ??
      process.env.DOTENV_PRIVATE_KEY_PRODUCTION ??
      process.env.DOTENV_PRIVATE_KEY_DEV ??
      process.env.DOTENV_PRIVATE_KEY_DEVELOPMENT;
    if (!process.env.DOTENV_PRIVATE_KEY && mappedPrivateKey) {
      process.env.DOTENV_PRIVATE_KEY = mappedPrivateKey;
    }

    const paths: string[] = [];
    const nodeEnv = process.env.NODE_ENV;
    if (nodeEnv === "production") {
      // Your repo uses `.env.prod` naming.
      paths.push(
        ".env.prod.local",
        ".env.prod",
        ".env.production.local",
        ".env.production",
        ".env.local",
        ".env"
      );
    } else {
      paths.push(
        ".env.dev.local",
        ".env.dev",
        ".env.development.local",
        ".env.development",
        ".env.local",
        ".env"
      );
    }

    dotenvx.config({
      path: paths,
      ignore: ["MISSING_ENV_FILE"],
      quiet: true,
    });
  } catch {
    // ignore
  }
}

function isBuildTime() {
  // Reliable in local + Vercel builds when invoked via `pnpm build`.
  const lifecycleEvent = process.env.npm_lifecycle_event;
  if (lifecycleEvent === "build") return true;

  const lifecycleScript = process.env.npm_lifecycle_script;
  if (lifecycleScript && lifecycleScript.includes("next build")) return true;

  // Fallback if Next sets it (not always present during page/data collection).
  if (process.env.NEXT_PHASE === "phase-production-build") return true;

  return false;
}

export function getRequiredEnv(name: string, options: RequiredEnvOptions = {}): string {
  const value = getEnv(name);
  if (value) return value;

  if (options.allowDuringBuild && isBuildTime()) {
    return options.buildFallback ?? "__BUILD_TIME_MISSING_ENV__";
  }

  throw new Error(`Missing required env var: ${name} with options: ${JSON.stringify(options)}`);
}
