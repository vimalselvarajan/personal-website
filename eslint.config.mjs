import { fixupConfigRules } from "@eslint/compat";
import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...fixupConfigRules(nextVitals),
  ...fixupConfigRules(nextTypeScript),
  {
    linterOptions: { reportUnusedDisableDirectives: "error" },
  },
  globalIgnores([".next/**", "out/**", "docs/**", "build/**", "next-env.d.ts"]),
]);
