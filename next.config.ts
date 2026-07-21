import type { NextConfig } from "next";

if (process.env.CLOUDFLARE_DB_BACKEND) {
  void import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) =>
    initOpenNextCloudflareForDev(),
  );
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/*": [
      ".env.prod",
      "drizzle/**/*.sql",
      "node_modules/pg-cloudflare/dist/index.js",
      "node_modules/pg-cloudflare/esm/index.mjs",
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.rebrickable.com",
      },
      {
        protocol: "https",
        hostname: "rebrickable.com",
      },
    ],
  },
};

export default nextConfig;
