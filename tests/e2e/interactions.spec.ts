import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { getSitemapPaths } from "./support";

function normalizedViolations(results: Awaited<ReturnType<AxeBuilder["analyze"]>>) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }));
}

test("keyboard users can activate the skip link", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeFocused();
});

test("mobile menu manages focus and closes with Escape", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation behavior");
  await page.goto("./");
  const button = page.getByRole("button", { name: "Open navigation menu" });
  await button.click();
  await expect(page.getByRole("button", { name: "Close navigation menu" })).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Mobile primary" }).getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeFocused();
  await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeHidden();
});

test("an explicit light theme persists across desktop and mobile navigation", async ({ page, isMobile }) => {
  await page.addInitScript(() => window.localStorage.removeItem("theme"));
  await page.goto("./");
  await page.getByRole("button", { name: /Theme: system/ }).click();
  await expect(page.locator("html")).toHaveClass(/light/);

  if (isMobile) {
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await page.getByRole("navigation", { name: "Mobile primary" })
      .getByRole("link", { name: "Projects", exact: true })
      .click();
  } else {
    await page.getByRole("navigation", { name: "Primary" })
      .getByRole("link", { name: "Projects", exact: true })
      .click();
  }

  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(page.getByRole("button", { name: /Theme: light/ })).toBeVisible();
});

test("desktop résumé timeline tracks its active entry and links to related work", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop career index behavior");
  await page.goto("./resume/");

  const timeline = page.getByRole("navigation", { name: "Career timeline" });
  const lonardiLink = timeline.getByRole("link", { name: /Lonardi Lab/ });
  await lonardiLink.click();
  await expect(page).toHaveURL(/#experience-lonardi-lab$/);
  await expect(lonardiLink).toHaveAttribute("aria-current", "location");
  await expect(page.locator("#experience-lonardi-lab")).toBeInViewport();
  await expect(page.locator("#experience-lonardi-lab").getByRole("link", { name: "Explore MTP Lite research" }))
    .toHaveAttribute("href", /\/research\/optimal-read-selection\/$/);

  await page.locator("#experience-hastest").evaluate((element) => element.scrollIntoView({ block: "center" }));
  await expect(timeline.getByRole("link", { name: /Hastest/ })).toHaveAttribute("aria-current", "location");
});

test("mobile résumé timeline keeps the current role visible while scrolling", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile career status behavior");
  await page.goto("./resume/");
  await page.locator("#experience-sadredini-lab").evaluate((element) => element.scrollIntoView({ block: "center" }));
  await expect(page.locator('[data-active-timeline-label="sadredini-lab"]')).toBeVisible();
});

test("résumé remains complete in print and reduced-motion modes", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("./resume/");
  const transitionDuration = await page.locator("#experience-brisk-lab .resume-timeline-card")
    .evaluate((element) => Number.parseFloat(getComputedStyle(element).transitionDuration));
  expect(transitionDuration).toBeLessThan(0.001);

  await page.emulateMedia({ media: "print", reducedMotion: "reduce" });
  await expect(page.getByRole("navigation", { name: "Career timeline" })).toBeHidden();
  await expect(page.locator("[data-experience-id]")).toHaveCount(4);
  await expect(page.getByText(/Researched and documented an Intel Simics/)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Genome Assembly Optimization Using k-mer-Based Read Selection" })).toBeVisible();
});

test("all sitemap routes have no accessibility violations in light or dark themes", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "One engine covers the full axe route matrix");
  test.setTimeout(180_000);
  const paths = await getSitemapPaths(request);
  await page.goto("./");

  for (const theme of ["light", "dark"] as const) {
    await page.evaluate((selectedTheme) => window.localStorage.setItem("theme", selectedTheme), theme);
    for (const path of paths) {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response?.status(), `${theme} ${path}`).toBe(200);
      await expect(page.locator("html"), `${theme} ${path}`).toHaveClass(new RegExp(theme));
      const results = await new AxeBuilder({ page }).analyze();
      expect(normalizedViolations(results), `${theme} ${path}`).toEqual([]);
    }
  }
});

test("the open mobile menu has no accessibility violations in either theme", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-mobile", "Chromium mobile covers the open-menu state");
  test.setTimeout(60_000);
  await page.goto("./");

  for (const theme of ["light", "dark"] as const) {
    await page.evaluate((selectedTheme) => window.localStorage.setItem("theme", selectedTheme), theme);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass(new RegExp(theme));
    await page.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(normalizedViolations(results), `${theme} mobile menu`).toEqual([]);
  }
});

test("forced-colors mode preserves focus, controls, links, and reflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium provides forced-colors emulation");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ forcedColors: "active", colorScheme: "light" });
  await page.goto("./");

  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  const focusOutline = await skipLink.evaluate((element) => ({
    style: getComputedStyle(element).outlineStyle,
    width: Number.parseFloat(getComputedStyle(element).outlineWidth),
  }));
  expect(focusOutline.style).not.toBe("none");
  expect(focusOutline.width).toBeGreaterThanOrEqual(3);

  const themeButton = page.getByRole("button", { name: /Theme:/ });
  await expect(themeButton).toBeVisible();
  expect(await themeButton.evaluate((element) => Number.parseFloat(getComputedStyle(element).borderTopWidth)))
    .toBeGreaterThanOrEqual(1);

  const socialLink = page.getByRole("navigation", { name: "Social profiles" }).getByRole("link").first();
  expect(await socialLink.evaluate((element) => getComputedStyle(element).textDecorationLine)).toContain("underline");

  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();
  const overflow = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
});
