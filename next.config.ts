import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
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
