import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { productionBasePath } from "./config/site";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "export",
  distDir: "docs",
  basePath: process.env.NODE_ENV === "production" ? productionBasePath : "",
  trailingSlash: true,
  images: { unoptimized: true },
  typedRoutes: true,
  allowedDevOrigins: ["127.0.0.1"],
};

export default bundleAnalyzer({ enabled: process.env.ANALYZE === "true" })(nextConfig);
