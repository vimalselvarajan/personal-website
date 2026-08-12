import { spawnSync } from "node:child_process";
import path from "node:path";
import { resolveTypeScriptCli } from "./typescript-cli.mjs";

const required = {
  node: "24.19.0",
  npm: "11.17.0",
};

function detectNpmVersion() {
  const userAgentMatch = process.env.npm_config_user_agent?.match(/(?:^|\s)npm\/([^\s]+)/);
  if (userAgentMatch) return userAgentMatch[1];

  const result = spawnSync("npm", ["--version"], {
    encoding: "utf8",
    shell: false,
  });
  return result.status === 0 ? result.stdout.trim() : "unavailable";
}

const actual = {
  node: process.version.replace(/^v/, ""),
  npm: detectNpmVersion(),
};
const mismatches = Object.entries(required)
  .filter(([tool, version]) => actual[tool] !== version)
  .map(([tool, version]) => `${tool} ${version} (found ${actual[tool]})`);

if (mismatches.length > 0) {
  throw new Error(`This project requires ${mismatches.join(" and ")}. Run "nvm use" before continuing.`);
}

const compiler = resolveTypeScriptCli();
const compilerPath = path.relative(process.cwd(), compiler.compilerPath);
console.log(
  `Toolchain verified: Node ${actual.node}, npm ${actual.npm}, TypeScript ${compiler.version} (${compilerPath})`,
);
