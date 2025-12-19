import { RebrickableApiClient, type Set } from "@brakbricks/rebrickable-api";

import { requiredEnv } from "@/lib/env";

export function rebrickableClient() {
  return new RebrickableApiClient(
    requiredEnv("REBRICKABLE_API_KEY", {
      allowDuringBuild: true,
      buildFallback: "__BUILD_TIME_REBRICKABLE_KEY__",
    }),
  );
}

export type RebrickableSet = Pick<
  Set,
  "set_num" | "name" | "year" | "set_img_url"
>;
