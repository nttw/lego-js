import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// The app is fully dynamic today, so no R2 incremental cache is required for
// these comparison deployments. It can be added later without changing DB code.
export default defineCloudflareConfig({});
