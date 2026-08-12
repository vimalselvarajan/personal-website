import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL(".", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.{ts,tsx,mjs}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json-summary"],
      include: [
        "lib/content-repository.ts",
        "lib/content-schema.ts",
        "lib/image-dimensions.ts",
        "lib/links.ts",
        "lib/metadata.ts",
        "lib/project-image-variants.ts",
        "lib/routes.ts",
        "scripts/lighthouse-image-audit.mjs",
        "scripts/serve-export.mjs",
      ],
      thresholds: {
        perFile: true,
        lines: 90,
        statements: 90,
        functions: 90,
        branches: 85,
      },
    },
  },
});
