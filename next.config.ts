import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for @microsoft/microsoft-graph-client
  serverExternalPackages: ["isomorphic-fetch"],
};

export default nextConfig;
