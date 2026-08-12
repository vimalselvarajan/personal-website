import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export const requiredTypeScriptVersion = "7.0.2";

function readManifest(manifestPath) {
  try {
    return JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(`Unable to read the required TypeScript package at ${manifestPath}`, { cause: error });
  }
}

export function resolveTypeScriptCli(root = process.cwd()) {
  const packageDirectory = path.resolve(root, "node_modules", "typescript");
  const manifestPath = path.join(packageDirectory, "package.json");
  const manifest = readManifest(manifestPath);

  if (manifest.name !== "typescript" || manifest.version !== requiredTypeScriptVersion) {
    throw new Error(
      `Expected typescript@${requiredTypeScriptVersion} at ${manifestPath}; found ${manifest.name ?? "unknown"}@${manifest.version ?? "unknown"}`,
    );
  }
  if (manifest.bin?.tsc !== "./bin/tsc") {
    throw new Error(`Unexpected TypeScript CLI declaration in ${manifestPath}: ${manifest.bin?.tsc ?? "missing"}`);
  }

  let realPackageDirectory;
  let compilerPath;
  try {
    realPackageDirectory = fs.realpathSync(packageDirectory);
    compilerPath = fs.realpathSync(path.resolve(packageDirectory, manifest.bin.tsc));
  } catch (error) {
    throw new Error(`Unable to resolve the TypeScript ${requiredTypeScriptVersion} CLI`, { cause: error });
  }

  const expectedCompilerPath = path.join(realPackageDirectory, "bin", "tsc");
  if (compilerPath !== expectedCompilerPath) {
    throw new Error(`TypeScript CLI resolved to ${compilerPath}; expected ${expectedCompilerPath}`);
  }

  const versionResult = spawnSync(process.execPath, [compilerPath, "--version"], {
    encoding: "utf8",
    shell: false,
  });
  if (versionResult.status !== 0) {
    throw new Error(`Unable to execute ${compilerPath}: ${(versionResult.stderr ?? "").trim() || versionResult.error?.message || "unknown error"}`);
  }
  const actualVersion = versionResult.stdout.trim().replace(/^Version\s+/, "");
  if (actualVersion !== requiredTypeScriptVersion) {
    throw new Error(`TypeScript CLI at ${compilerPath} reported ${actualVersion}; expected ${requiredTypeScriptVersion}`);
  }

  return { compilerPath, version: actualVersion };
}
