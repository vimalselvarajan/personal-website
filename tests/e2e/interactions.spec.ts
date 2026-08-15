import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { getSitemapPaths } from "./support";

function normalizedViolations(results: Awaited<ReturnType<AxeBuilder["analyze"]>>) {
  return results.violations.map((violation) => ({ id: violation.id, impact: violation.impact, targets: violation.nodes.map((node) => node.target) }));
}

async function installViewTransitionProbe(page: Page) {
  await page.addInitScript(() => {
    const probe = { calls: 0, supported: Boolean(document.startViewTransition) };
    Reflect.set(window, "__portfolioViewTransitionProbe", probe);
    if (!document.startViewTransition) return;
    const original = document.startViewTransition.bind(document);
    Object.defineProperty(document, "startViewTransition", { configurable: true, value: (update: Parameters<Document["startViewTransition"]>[0]) => { probe.calls += 1; return original(update); } });
  });
}

test("keyboard users can activate the skip link", async ({ page }) => {
  await page.goto("./");
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/#main-content$/);
  await expect(page.locator("#main-content")).toBeFocused();
});

test("home actions are branded, accessible icon links", async ({ page }) => {
  await page.goto("./");
  await expect(page.locator("#selected-work")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Engineering with evidence behind it." })).toHaveCount(0);
  await expect(page.locator("#site-footer")).not.toBeVisible();

  const github = page.getByRole("link", { name: "GitHub (opens in a new tab)" });
  const linkedin = page.getByRole("link", { name: "LinkedIn (opens in a new tab)" });
  const resume = page.getByRole("link", { name: "Résumé", exact: true });

  await expect(github).toHaveAttribute("href", "https://github.com/vimalselvarajan");
  await expect(github).toHaveAttribute("target", "_blank");
  await expect(github).toHaveAttribute("rel", "noopener noreferrer");
  await expect(github).toHaveAttribute("title", "GitHub");
  await expect(github).toHaveCSS("background-color", "rgb(36, 41, 47)");

  await expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/vimal-selvarajan/");
  await expect(linkedin).toHaveAttribute("target", "_blank");
  await expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
  await expect(linkedin).toHaveAttribute("title", "LinkedIn");
  await expect(linkedin).toHaveCSS("background-color", "rgb(10, 102, 194)");

  await expect(resume).toHaveAttribute("href", /resume/);
  await expect(resume).toHaveAttribute("title", "Résumé");
  await expect(resume).not.toHaveAttribute("target");

  const targetSizes = await page.locator(".landing-actions a").evaluateAll((links) => links.map((link) => {
    const bounds = link.getBoundingClientRect();
    return { width: bounds.width, height: bounds.height };
  }));
  expect(targetSizes).toEqual([{ width: 44, height: 44 }, { width: 44, height: 44 }, { width: 44, height: 44 }]);

  await resume.click();
  await expect(page).toHaveURL(/resume/);
});

test("nested research routes keep their collection tab active", async ({ page, isMobile }) => {
  await page.goto("./research/optimal-read-selection/");
  const navigation = page.getByRole("navigation", { name: isMobile ? "Mobile primary" : "Primary" });
  await expect(navigation.getByRole("link", { name: "Research", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(navigation.getByRole("link", { name: "Projects", exact: true })).toHaveCount(0);
});

test("Projects reserves a third featured slot with responsive spacing", async ({ page }) => {
  await page.goto("./projects/");

  const featuredScenes = page.locator(".project-featured-grid > .atlas-scene");
  await expect(featuredScenes).toHaveCount(3);
  expect(await featuredScenes.evaluateAll((scenes) => scenes.map((scene) => scene.getAttribute("data-layout")))).toEqual([
    "forward",
    "reverse",
    "forward",
  ]);

  await expect(featuredScenes.nth(0).getByRole("link", { name: "Project details" })).toHaveAttribute("href", /\/projects\/mtp-lite\/$/);
  await expect(featuredScenes.nth(0).getByRole("link", { name: "GitHub" })).toBeVisible();
  await expect(featuredScenes.nth(1).getByRole("link", { name: "Project details" })).toHaveAttribute("href", /\/projects\/hastest-control-suite\/$/);
  await expect(featuredScenes.nth(1).getByRole("link", { name: "GitHub" })).toBeVisible();

  const reservedSlot = featuredScenes.nth(2);
  await expect(reservedSlot).toHaveAttribute("data-scene", "reserved-project-slot");
  await expect(reservedSlot.getByRole("heading", { name: "Project in progress" })).toBeVisible();
  await expect(reservedSlot.getByText("Reserved for the next featured build.")).toBeVisible();
  await expect(reservedSlot.getByRole("link")).toHaveCount(0);

  const gaps = await featuredScenes.evaluateAll((scenes) => scenes.slice(1).map((scene, index) => {
    const previous = scenes[index]!.getBoundingClientRect();
    const current = scene.getBoundingClientRect();
    return current.top - previous.bottom;
  }));
  expect(gaps.every((gap) => gap >= 79)).toBe(true);
});

test("mobile dock is keyboard-accessible and tracks research", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation behavior");
  await page.goto("./");
  const dock = page.getByRole("navigation", { name: "Mobile primary" });
  const research = dock.getByRole("link", { name: "Research", exact: true });
  await research.focus();
  await expect(research).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/research\/$/);
  await expect(research).toHaveAttribute("aria-current", "page");
});

test("an explicit light theme persists through research navigation", async ({ page, isMobile }) => {
  await page.addInitScript(() => window.localStorage.removeItem("theme"));
  await page.goto("./");
  await page.getByRole("button", { name: /Theme: system/ }).click();
  const navigation = page.getByRole("navigation", { name: isMobile ? "Mobile primary" : "Primary" });
  await navigation.getByRole("link", { name: "Research", exact: true }).click();
  await expect(page).toHaveURL(/\/research\/$/);
  await expect(page.locator("html")).toHaveClass(/light/);
});

test("résumé preserves research links but omits removed project links", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop career index behavior");
  await page.goto("./resume/");
  const lonardi = page.locator("#experience-lonardi-lab");
  await expect(lonardi.getByRole("link", { name: "Explore MTP Lite research" })).toHaveAttribute("href", /\/research\/optimal-read-selection\/$/);
  await expect(page.locator("#experience-hastest").getByRole("link")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Projects", exact: true })).toHaveCount(0);
});

test("Resume uses a paper-white light theme and retains its dark hero", async ({ page, isMobile }) => {
  await page.addInitScript(() => window.localStorage.removeItem("theme"));
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("./resume/");

  const hero = page.locator(".resume-hero");
  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(hero).toHaveCSS("background-color", "rgb(255, 255, 255)");
  if (isMobile) {
    await expect(page.locator(".resume-hero-orb")).toBeHidden();
    await expect.poll(() => hero.evaluate((element) => getComputedStyle(element, "::after").display)).toBe("none");
  } else {
    await expect(page.locator(".resume-hero-orb")).toBeVisible();
    await expect.poll(() => hero.evaluate((element) => getComputedStyle(element, "::after").display)).toBe("block");
  }
  const lightHeroBackground = await hero.evaluate((element) => getComputedStyle(element).backgroundColor);

  await page.emulateMedia({ colorScheme: "dark" });
  await expect(page.locator("html")).toHaveClass(/dark/);
  await expect.poll(() => hero.evaluate((element) => getComputedStyle(element).backgroundColor)).not.toBe(lightHeroBackground);
});

test("route transitions work for retained research pages", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium covers native view transitions");
  await installViewTransitionProbe(page);
  await page.goto("./");
  test.skip(!(await page.evaluate(() => (Reflect.get(window, "__portfolioViewTransitionProbe") as { supported: boolean }).supported)), "View transitions are not supported");
  await page.getByRole("link", { name: "Read the research overview" }).click();
  await expect(page).toHaveURL(/\/research\/optimal-read-selection\/$/);
  await expect.poll(() => page.evaluate(() => (Reflect.get(window, "__portfolioViewTransitionProbe") as { calls: number }).calls)).toBeGreaterThan(0);
});

test("all public routes have no serious accessibility violations", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "One engine covers the route matrix");
  for (const route of await getSitemapPaths(request)) {
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    expect(normalizedViolations(results), route).toEqual([]);
  }
});
