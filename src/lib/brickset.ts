import { BricksetApiClient, type BricksetSet } from "@brakbricks/brickset-api";

import { getRequiredEnv } from "@/lib/env";

export function bricksetClient() {
  return new BricksetApiClient(
    getRequiredEnv("BRICKSET_API_KEY", {
      allowDuringBuild: true,
      buildFallback: "__BUILD_TIME_BRICKSET_KEY__",
    }),
  );
}

export type BricksetSetSummary = Pick<BricksetSet, "number" | "name" | "year" | "LEGOCom">;
