import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { chromium } from "@playwright/test";

const basePath = process.env.PORTFOLIO_BASE_PATH ?? "/Personal-Website";
const origin = process.env.PORTFOLIO_ORIGIN ?? "http://127.0.0.1:3000";
const runs = Number(process.env.PORTFOLIO_LIGHTHOUSE_RUNS ?? 3);
const reportRoot = process.env.PORTFOLIO_LIGHTHOUSE_DIR ?? path.join(os.tmpdir(), "portfolio-lighthouse");
const defaultRoutes = ["/", "/projects/", "/projects/12v-to-3v3-buck-converter/", "/research/optimal-read-selection/", "/resume/"];
const routes = process.env.PORTFOLIO_LIGHTHOUSE_ROUTES?.split(",").filter(Boolean) ?? defaultRoutes;
const lighthouseBin = path.join(process.cwd(), "node_modules", ".bin", "lighthouse");
const chromePath = process.env.CHROME_PATH ?? chromium.executablePath();
fs.mkdirSync(reportRoot, { recursive: true });

let server;

async function serverIsAvailable() {
  try {
    return (await fetch(`${origin}${basePath}/`)).ok;
  } catch {
    return false;
  }
}

async function waitForServer() {
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${origin}${basePath}/`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Timed out waiting for the static export server");
}

function median(values) {
  return [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
}

let failed = false;
try {
  if (!(await serverIsAvailable())) {
    server = spawn("npm", ["run", "preview"], { cwd: process.cwd(), env: process.env, stdio: "inherit" });
  }
  await waitForServer();
  for (const route of routes) {
    const reports = [];
    const label = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replaceAll("/", "-");
    for (let run = 1; run <= runs; run += 1) {
      const output = path.join(reportRoot, `${label}-${run}.json`);
      const result = spawnSync(lighthouseBin, [`${origin}${basePath}${route}`, "--output=json", `--output-path=${output}`, "--quiet", "--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage", "--only-categories=performance,accessibility"], {
        stdio: "inherit",
        env: { ...process.env, CHROME_PATH: chromePath },
      });
      if (result.status !== 0) throw new Error(`Lighthouse failed for ${route} run ${run}`);
      reports.push(JSON.parse(fs.readFileSync(output, "utf8")));
    }

    const performance = median(reports.map((report) => report.categories.performance.score * 100));
    const accessibility = median(reports.map((report) => report.categories.accessibility.score * 100));
    const lcp = median(reports.map((report) => report.audits["largest-contentful-paint"].numericValue));
    const cls = median(reports.map((report) => report.audits["cumulative-layout-shift"].numericValue));
    const tbt = median(reports.map((report) => report.audits["total-blocking-time"].numericValue));
    const passed = performance >= 95 && accessibility >= 95 && lcp <= 2500 && cls <= 0.1 && tbt <= 200;
    console.log(`${passed ? "PASS" : "FAIL"} ${route}: performance=${performance}, accessibility=${accessibility}, LCP=${Math.round(lcp)}ms, CLS=${cls.toFixed(3)}, TBT=${Math.round(tbt)}ms`);
    if (!passed) failed = true;
  }
} finally {
  server?.kill("SIGTERM");
}

if (failed) process.exitCode = 1;
