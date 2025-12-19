type RequiredEnvOptions = {
  /**
   * Next.js imports server modules during `next build` to collect route/page data.
   * Allowing a build-time fallback keeps builds green without weakening runtime checks.
   */
  allowDuringBuild?: boolean;
  buildFallback?: string;
};

function isNextBuildPhase() {
  return process.env.NEXT_PHASE === "phase-production-build";
}

export function requiredEnv(name: string, options: RequiredEnvOptions = {}): string {
  const value = process.env[name];
  if (value) return value;

  if (options.allowDuringBuild && isNextBuildPhase()) {
    return options.buildFallback ?? "__BUILD_TIME_MISSING_ENV__";
  }

  throw new Error(`Missing required env var: ${name}`);
}
