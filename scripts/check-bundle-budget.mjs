import fs from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";

const outputRoot = path.resolve(process.cwd(), "docs");
const budgets = JSON.parse(fs.readFileSync(path.join(process.cwd(), "performance-budgets.json"), "utf8"));

function routeJavaScriptBytes(htmlFile) {
  const html = fs.readFileSync(path.join(outputRoot, htmlFile), "utf8");
  const sources = [...html.matchAll(/<script[^>]+src="([^"]+\.js(?:\?[^"]*)?)"/g)].map((match) => match[1]);
  const files = new Set(sources.map((source) => {
    const pathname = decodeURIComponent(new URL(source, "https://example.test").pathname);
    const nextAsset = pathname.slice(pathname.indexOf("/_next/") + 1);
    return path.join(outputRoot, nextAsset);
  }));
  return [...files].reduce((total, file) => total + gzipSync(fs.readFileSync(file)).byteLength, 0);
}

let failed = false;
for (const [route, budget] of Object.entries(budgets.clientJavaScript)) {
  const bytes = routeJavaScriptBytes(budget.html);
  const maximum = Math.floor(budget.baselineGzipBytes * (1 + budgets.maxIncreasePercent / 100));
  const passed = bytes <= maximum;
  console.log(`${passed ? "PASS" : "FAIL"} ${route}: ${bytes} gzip bytes (budget ${maximum})`);
  if (!passed) failed = true;
}

for (const file of budgets.responsiveImages.files) {
  const absoluteFile = path.join(outputRoot, file);
  if (!fs.existsSync(absoluteFile)) {
    console.log(`FAIL /${file}: missing from static export`);
    failed = true;
    continue;
  }
  const bytes = fs.statSync(absoluteFile).size;
  const passed = bytes <= budgets.responsiveImages.maximumBytes;
  console.log(`${passed ? "PASS" : "FAIL"} /${file}: ${bytes} bytes (budget ${budgets.responsiveImages.maximumBytes})`);
  if (!passed) failed = true;
}

if (failed) process.exitCode = 1;
