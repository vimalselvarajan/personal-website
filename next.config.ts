import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import path from "node:path";
import { fileURLToPath } from "node:url";

const productionBasePath = "/Personal-Website";
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  basePath: process.env.NODE_ENV === "production" ? (process.env.PAGES_BASE_PATH ?? productionBasePath) : "",
  trailingSlash: true,
  images: { unoptimized: true },
  turbopack: { root: projectRoot },
  experimental: { useTypeScriptCli: false },
  allowedDevOrigins: ["127.0.0.1"],
};

export default bundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
