// import { get as dotenvxGet } from "@dotenvx/dotenvx";
// import { config } from "@dotenvx/dotenvx";

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

// let dotenvxConfigured = false;

/**
 * Reads an environment variable.
 *
 * Default behavior is to prefer `process.env` (works with `dotenvx run ...`).
 * If missing, we fall back to `dotenvx.get()` (decrypt-at-access) when available.
 */
export function getEnv(name: string): string | undefined {
  return process.env[name];

  // if (!dotenvxConfigured) {
  //   config({ convention: "nextjs" });
  //   dotenvxConfigured = true;
  // }

  // const fromProcess = process.env[name];
  // if (fromProcess && fromProcess.length > 0) return fromProcess;

  // try {
  //   const fromDotenvx = dotenvxGet(name);
  //   return fromDotenvx && fromDotenvx.length > 0 ? fromDotenvx : undefined;
  // } catch {
  //   return undefined;
  // }
}

// function isNextBuildPhase() {
//   return getEnv("NEXT_PHASE") === "phase-production-build";
// }

export function getRequiredEnv(name: string, options: RequiredEnvOptions = {}): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name} with options: ${JSON.stringify(options)}`);
  }
  return value;
  // const value = getEnv(name);
  // if (value) return value;

  // if (options.allowDuringBuild && isNextBuildPhase()) {
  //   return options.buildFallback ?? "__BUILD_TIME_MISSING_ENV__";
  // }

  // throw new Error(`Missing required env var: ${name}`);
}
