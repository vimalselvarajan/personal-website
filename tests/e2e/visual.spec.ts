import { expect, test } from "@playwright/test";

const phoneViewports = [
  { label: "narrow", width: 320, height: 720 },
  { label: "standard", width: 390, height: 844 },
  { label: "wide", width: 430, height: 932 },
] as const;

for (const [name, route] of [
  ["home", "./"],
  ["projects", "./projects/"],
  ["research", "./research/"],
  ["resume", "./resume/"],
] as const) {
  test(`${name} visual baseline`, async ({ page, browserName, isMobile }) => {
    test.skip(browserName !== "chromium", "Visual baselines are intentionally Chromium-only");

    if (isMobile) {
      for (const viewport of phoneViewports) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(route, { waitUntil: "networkidle" });
        const suffix = viewport.label === "standard" ? "mobile" : `mobile-${viewport.label}`;
        await expect(page).toHaveScreenshot(`${name}-${suffix}.png`, {
          animations: "disabled",
          fullPage: true,
          maxDiffPixelRatio: 0.01,
        });
      }
      return;
    }

    if (name === "resume") {
      await page.addInitScript(() => window.localStorage.setItem("theme", "light"));
    }
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot(`${name}-desktop.png`, {
      animations: "disabled",
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
}
