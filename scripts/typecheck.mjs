import { spawnSync } from "node:child_process";
import { resolveTypeScriptCli } from "./typescript-cli.mjs";

const { compilerPath } = resolveTypeScriptCli();
const result = spawnSync(
  process.execPath,
  [compilerPath, "--noEmit", "--incremental", "false"],
  { stdio: "inherit", shell: false },
);

if (result.error) throw result.error;
if (result.signal) {
  throw new Error(`TypeScript 7 compiler terminated with signal ${result.signal}`);
}
if (result.status === null) {
  throw new Error("TypeScript 7 compiler did not report an exit status");
}

process.exitCode = result.status;
