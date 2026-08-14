import { expect, test } from "@playwright/test";

for (const [name, route] of [
  ["home", "./"],
  ["projects", "./projects/"],
  ["research", "./research/"],
  ["project-detail", "./projects/12v-to-3v3-buck-converter/"],
  ["resume", "./resume/"],
] as const) {
  test(`${name} visual baseline`, async ({ page, browserName, isMobile }) => {
    test.skip(browserName !== "chromium", "Visual baselines are intentionally Chromium-only");
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page).toHaveScreenshot(`${name}-${isMobile ? "mobile" : "desktop"}.png`, {
      animations: "disabled",
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
}
