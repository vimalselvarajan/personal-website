import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { chromium } from "@playwright/test";
import { productionBasePath } from "../config/site.ts";
import { createExportServer } from "./serve-export.mjs";
import { countResponsiveImageFindings } from "./lighthouse-image-audit.mjs";

const runs = Number(process.env.PORTFOLIO_LIGHTHOUSE_RUNS ?? 3);
if (!Number.isInteger(runs) || runs < 1) throw new Error("PORTFOLIO_LIGHTHOUSE_RUNS must be a positive integer");
const reportRoot = path.resolve(process.env.PORTFOLIO_LIGHTHOUSE_DIR ?? path.join(os.tmpdir(), "portfolio-lighthouse"));
const defaultRoutes = ["/", "/research/optimal-read-selection/", "/resume/"];
const routes = process.env.PORTFOLIO_LIGHTHOUSE_ROUTES?.split(",").map((route) => route.trim()).filter(Boolean) ?? defaultRoutes;
const lighthouseBin = path.join(process.cwd(), "node_modules", ".bin", "lighthouse");
const chromePath = process.env.CHROME_PATH ?? chromium.executablePath();
fs.mkdirSync(reportRoot, { recursive: true });

function listen(server) {
  return new Promise((resolve, reject) => {
    const onError = (error) => reject(error);
    server.once("error", onError);
    server.listen(0, "127.0.0.1", () => {
      server.off("error", onError);
      const address = server.address();
      if (!address || typeof address === "string") reject(new Error("Lighthouse server did not bind to a TCP port"));
      else resolve(`http://127.0.0.1:${address.port}`);
    });
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

function runLighthouse(args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(lighthouseBin, args, { stdio: "inherit", env });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`Lighthouse exited with ${signal ? `signal ${signal}` : `code ${code}`}`));
    });
  });
}

function median(values) {
  return [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)];
}

let failed = false;
const server = createExportServer();
try {
  const origin = await listen(server);
  for (const route of routes) {
    const reports = [];
    const label = route === "/" ? "home" : route.replace(/^\/|\/$/g, "").replaceAll("/", "-");
    for (let run = 1; run <= runs; run += 1) {
      const output = path.join(reportRoot, `${label}-${run}.json`);
      const profile = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-lighthouse-chrome-"));
      try {
        await runLighthouse([
          `${origin}${productionBasePath}${route}`,
          "--output=json",
          `--output-path=${output}`,
          "--quiet",
          `--chrome-flags=--headless --no-sandbox --disable-dev-shm-usage --user-data-dir=${profile}`,
          "--only-categories=performance,accessibility",
          "--locale=en-US",
        ], { ...process.env, CHROME_PATH: chromePath });
      } finally {
        fs.rmSync(profile, { recursive: true, force: true });
      }
      reports.push(JSON.parse(fs.readFileSync(output, "utf8")));
    }

    const performance = median(reports.map((report) => report.categories.performance.score * 100));
    const accessibility = median(reports.map((report) => report.categories.accessibility.score * 100));
    const lcp = median(reports.map((report) => report.audits["largest-contentful-paint"].numericValue));
    const cls = median(reports.map((report) => report.audits["cumulative-layout-shift"].numericValue));
    const tbt = median(reports.map((report) => report.audits["total-blocking-time"].numericValue));
    const responsiveImageFindings = reports.reduce((count, report) => count + countResponsiveImageFindings(report), 0);
    const passed = performance >= 95 && accessibility >= 95 && lcp <= 2500 && cls <= 0.1 && tbt <= 200 && responsiveImageFindings === 0;
    console.log(`${passed ? "PASS" : "FAIL"} ${route}: performance=${performance}, accessibility=${accessibility}, LCP=${Math.round(lcp)}ms, CLS=${cls.toFixed(3)}, TBT=${Math.round(tbt)}ms, oversized-images=${responsiveImageFindings}`);
    if (!passed) failed = true;
  }
} finally {
  if (server.listening) await close(server);
}

if (failed) process.exitCode = 1;
