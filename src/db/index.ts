import { cache } from "react";

import { getCloudflareDbBackend } from "./runtime";

// React cache scopes Cloudflare DB clients to the active request. The Node path
// retains its existing process singleton inside node.ts for local and Vercel use.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getDb = cache(async (): Promise<any> => {
  const cloudflareBackend = getCloudflareDbBackend();
  if (cloudflareBackend) {
    const { getCloudflareDb } = await import("./cloudflare");
    return getCloudflareDb();
  }

  const { getNodeDb } = await import("./node");
  return getNodeDb();
});

export type Db = Awaited<ReturnType<typeof getDb>>;

// Kept for scripts/tests that use the older factory name.
export const createDb = getDb;
