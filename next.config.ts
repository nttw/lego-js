import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  outputFileTracingIncludes: {
    "/*": [".env.prod"],
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
