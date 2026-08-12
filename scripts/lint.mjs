import Module, { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const originalResolveFilename = Module._resolveFilename;

Module._resolveFilename = function resolveTypeScript6(request, parent, isMain, options) {
  if (request === "typescript" || request.startsWith("typescript/")) {
    const compatibilityRequest = request.replace(/^typescript/, "@typescript/typescript6");
    return require.resolve(compatibilityRequest);
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};

try {
  const { ESLint } = await import("eslint");
  const arguments_ = process.argv.slice(2);
  const fix = arguments_.includes("--fix");
  const patterns = arguments_.filter((argument) => argument !== "--fix");
  const eslint = new ESLint({ fix });
  const results = await eslint.lintFiles(patterns.length > 0 ? patterns : ["."]);

  if (fix) await ESLint.outputFixes(results);

  const formatter = await eslint.loadFormatter("stylish");
  const output = formatter.format(results);
  if (output) process.stdout.write(output);

  const errorCount = results.reduce((count, result) => count + result.errorCount, 0);
  const warningCount = results.reduce((count, result) => count + result.warningCount, 0);
  const fixableErrorCount = results.reduce((count, result) => count + result.fixableErrorCount, 0);
  const fixableWarningCount = results.reduce((count, result) => count + result.fixableWarningCount, 0);

  if (errorCount > 0) {
    console.error(
      `ESLint found ${errorCount} error(s) and ${warningCount} warning(s) ` +
      `(${fixableErrorCount} error(s) and ${fixableWarningCount} warning(s) fixable).`,
    );
    process.exitCode = 1;
  }
} finally {
  Module._resolveFilename = originalResolveFilename;
}
