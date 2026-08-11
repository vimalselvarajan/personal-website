import { mkdir } from "node:fs/promises";
import { chromium } from "@playwright/test";

const baseUrl = process.env.PORTFOLIO_BASE_URL ?? "http://127.0.0.1:3000";
const screenshotDir = process.env.PORTFOLIO_SCREENSHOT_DIR ?? "/tmp/portfolio-ui-review";
const chromiumPath = process.env.PORTFOLIO_CHROMIUM_PATH;
await mkdir(screenshotDir, { recursive: true });

const projectSlugs = [
  "combat-chess",
  "12v-to-3v3-buck-converter",
  "driver-interfaces",
  "hastest-control-suite",
  "mini-genome-assembler",
];

const pageRoutes = [
  "/",
  "/projects",
  ...projectSlugs.map((slug) => `/projects/${slug}`),
  "/research",
  "/research/adaptive-cache-warming",
  "/research/secure-processing-in-memory",
  "/research/optimal-read-selection",
  "/about",
  "/resume",
];

const assetRoutes = [
  "/projects/combat_chess.png",
  "/projects/power_supply.png",
  "/projects/ergo.png",
  "/projects/hastest_project.jpg",
  "/projects/mini_assembler.png",
];

const browser = await chromium.launch({ headless: true, ...(chromiumPath ? { executablePath: chromiumPath } : {}) });
const errors = [];
const assertions = [];

function check(condition, message) {
  if (!condition) errors.push(message);
  assertions.push(`${condition ? "PASS" : "FAIL"} ${message}`);
}

async function makePage(context) {
  const page = await context.newPage();
  page.on("console", (message) => {
    const expectedNotFound = /\/(projects\/not-a-project|research\/not-research|writing)$/.test(new URL(page.url()).pathname) && message.text().includes("404");
    if (message.type() === "error" && !expectedNotFound) errors.push(`Console error at ${page.url()}: ${message.text()}`);
  });
  page.on("pageerror", (error) => errors.push(`Page error at ${page.url()}: ${error.message}`));
  return page;
}

try {
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "light" });
  const page = await makePage(desktop);

  for (const route of pageRoutes) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    check(response?.status() === 200, `${route} returns HTTP 200`);
    check((await page.locator("h1").count()) === 1, `${route} has exactly one h1`);
    check((await page.locator("main").count()) === 1, `${route} has one semantic main`);
    check(await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth), `${route} has no 1440px horizontal overflow`);
  }

  for (const route of ["/robots.txt", "/sitemap.xml", "/opengraph-image", ...assetRoutes]) {
    const response = await desktop.request.get(`${baseUrl}${route}`);
    check(response.status() === 200, `${route} returns HTTP 200`);
  }

  for (const route of ["/projects/not-a-project", "/research/not-research", "/writing"]) {
    const response = await page.goto(`${baseUrl}${route}`, { waitUntil: "domcontentloaded" });
    check(response?.status() === 404, `${route} returns HTTP 404`);
    check((await page.getByRole("heading", { name: /This path does not lead/ }).count()) === 1, `${route} renders the useful not-found state`);
  }

  await page.goto(`${baseUrl}/projects`, { waitUntil: "networkidle" });
  const projectHeadings = await page.locator("article h2").allTextContents();
  check(JSON.stringify(projectHeadings) === JSON.stringify([
    "Combat Chess",
    "+12V to +3V3 Buck Converter",
    "Driver Interfaces",
    "Hastest DAC, DAQ, and Power Supply Control Suite",
    "Mini Genome Assembler",
  ]), "projects retain the PREVIOUS ordering");
  check((await page.locator("article img").count()) === 5, "projects index renders all five migrated images");
  check(await page.locator("article img").evaluateAll((images) => images.every((image) => image.complete && image.naturalWidth > 0)), "all project images load successfully");
  check((await page.locator('article a[href^="https://github.com/vimalselvarajan/"]').count()) === 5, "every project exposes its GitHub link");

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  const resumeLink = page.getByRole("link", { name: /Résumé/ }).first();
  check((await resumeLink.getAttribute("href")) === "/resume", "home résumé action uses the native résumé page");
  const internalHrefs = await page.locator('a[href^="/"]').evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute("href")).filter(Boolean));
  for (const href of [...new Set(internalHrefs)]) {
    const path = href.split("#")[0] || "/";
    const response = await desktop.request.get(`${baseUrl}${path}`, { maxRedirects: 0 });
    check(response.status() < 400, `home internal link ${href} is not broken`);
  }

  const screenshotRoutes = [
    ["home", "/"],
    ["projects", "/projects"],
    ["project-detail", "/projects/12v-to-3v3-buck-converter"],
    ["research", "/research"],
    ["research-detail", "/research/optimal-read-selection"],
    ["about", "/about"],
    ["resume", "/resume"],
  ];
  for (const [name, route] of screenshotRoutes) {
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await page.screenshot({ path: `${screenshotDir}/desktop-${name}.png`, fullPage: true });
  }

  await page.goto(baseUrl, { waitUntil: "domcontentloaded" });
  await page.keyboard.press("Tab");
  check((await page.locator(":focus").textContent())?.includes("Skip to content") === true, "first keyboard focus lands on the skip link");
  check(await page.locator(":focus").evaluate((element) => getComputedStyle(element).transform !== "none"), "skip link is visibly revealed on focus");
  await desktop.close();

  for (const [width, height, label, captureRoutes] of [
    [768, 900, "tablet", [["home", "/"], ["projects", "/projects"], ["research", "/research"]]],
    [375, 812, "mobile", [["home", "/"], ["projects", "/projects"], ["project-detail", "/projects/mini-genome-assembler"], ["research", "/research"], ["about", "/about"], ["resume", "/resume"]]],
  ]) {
    const context = await browser.newContext({ viewport: { width, height }, colorScheme: "light" });
    const responsivePage = await makePage(context);
    for (const [name, route] of captureRoutes) {
      await responsivePage.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
      check(await responsivePage.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth), `${route} has no ${width}px horizontal overflow`);
      await responsivePage.screenshot({ path: `${screenshotDir}/${label}-${name}.png`, fullPage: true });
    }
    if (label === "mobile") {
      await responsivePage.goto(baseUrl, { waitUntil: "domcontentloaded" });
      const menuButton = responsivePage.getByRole("button", { name: "Open navigation menu" });
      const menuId = await menuButton.getAttribute("aria-controls");
      await menuButton.click();
      check((await responsivePage.locator(`[aria-controls="${menuId}"]`).getAttribute("aria-expanded")) === "true", "mobile menu exposes expanded state");
      check(await responsivePage.getByRole("navigation", { name: "Mobile primary" }).isVisible(), "mobile navigation becomes visible");
      const mobileResume = responsivePage.getByRole("navigation", { name: "Mobile primary" }).getByRole("link", { name: /Résumé/ });
      check((await mobileResume.getAttribute("href")) === "/resume", "mobile navigation exposes the native résumé page");
      await responsivePage.screenshot({ path: `${screenshotDir}/mobile-menu.png`, fullPage: false });
    }
    await context.close();
  }

  const dark = await browser.newContext({ viewport: { width: 1440, height: 1000 }, colorScheme: "dark", reducedMotion: "reduce" });
  const darkPage = await makePage(dark);
  await darkPage.goto(baseUrl, { waitUntil: "networkidle" });
  check(await darkPage.locator("html").evaluate((html) => html.classList.contains("dark")), "system dark preference applies the dark theme");
  check(await darkPage.evaluate(() => matchMedia("(prefers-reduced-motion: reduce)").matches), "reduced-motion preference is active");
  const themeButton = darkPage.getByRole("button", { name: /Theme: system/ });
  await themeButton.click();
  check(!(await darkPage.locator("html").evaluate((html) => html.classList.contains("dark"))), "theme control switches from system-dark to explicit light");
  await darkPage.getByRole("button", { name: /Theme: light/ }).click();
  check(await darkPage.locator("html").evaluate((html) => html.classList.contains("dark")), "theme control switches from explicit light to dark");
  await darkPage.screenshot({ path: `${screenshotDir}/dark-home.png`, fullPage: true });
  await darkPage.goto(`${baseUrl}/projects/12v-to-3v3-buck-converter`, { waitUntil: "networkidle" });
  await darkPage.screenshot({ path: `${screenshotDir}/dark-project-detail.png`, fullPage: true });
  await dark.close();
} finally {
  await browser.close();
}

for (const line of assertions) console.log(line);
console.log(`Screenshots: ${screenshotDir}`);
if (errors.length) {
  console.error("\nValidation failures:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
}
