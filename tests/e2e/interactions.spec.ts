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

test("interior pages expose compact footer navigation", async ({ page }) => {
  await page.goto("./projects/");

  const footer = page.locator("#site-footer");
  await expect(footer).toBeVisible();

  const explore = footer.getByRole("navigation", { name: "Footer" });
  const connect = footer.getByRole("navigation", { name: "Contact and social links" });
  await expect(explore.getByRole("link")).toHaveCount(5);
  await expect(connect.getByRole("link")).toHaveCount(3);

  for (const label of ["Home", "Projects", "Research", "About", "Résumé"]) {
    await expect(explore.getByRole("link", { name: label, exact: true })).toBeVisible();
  }

  await expect(connect.getByRole("link", { name: "Email", exact: true })).toHaveAttribute("href", "mailto:vimalselvarajan@gmail.com");
  for (const label of ["GitHub", "LinkedIn"]) {
    const link = connect.getByRole("link", { name: `${label} (opens in a new tab)` });
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  }

  const targetHeights = await footer.getByRole("link").evaluateAll((links) => links.map((link) => link.getBoundingClientRect().height));
  expect(targetHeights.every((height) => height >= 44)).toBe(true);

  const results = await new AxeBuilder({ page }).include("#site-footer").analyze();
  expect(normalizedViolations(results)).toEqual([]);

  await page.evaluate(() => window.localStorage.setItem("theme", "dark"));
  await page.reload();
  await expect(page.locator("html")).toHaveClass(/dark/);
  const darkResults = await new AxeBuilder({ page }).include("#site-footer").analyze();
  expect(normalizedViolations(darkResults)).toEqual([]);
});

test("nested research routes keep their collection tab active", async ({ page, isMobile }) => {
  await page.goto("./research/optimal-read-selection/");
  const navigation = page.getByRole("navigation", { name: isMobile ? "Mobile primary" : "Primary" });
  await expect(navigation.getByRole("link", { name: "Research", exact: true })).toHaveAttribute("aria-current", "page");
  if (isMobile) {
    await expect(navigation.getByRole("link")).toHaveCount(4);
    await expect(navigation.getByRole("link", { name: "Projects", exact: true })).toBeVisible();
  } else {
    await expect(navigation.getByRole("link", { name: "Projects", exact: true })).toHaveCount(0);
  }
});

test("Projects exposes C-Audit as the third GitHub-only featured card with responsive spacing", async ({ page }) => {
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

  const cAudit = featuredScenes.nth(2);
  await expect(cAudit).toHaveAttribute("data-scene", "c-audit");
  await expect(cAudit.getByRole("heading", { name: "C-Audit" })).toBeVisible();
  await expect(cAudit.getByText("Available on GitHub.")).toBeVisible();
  const githubLink = cAudit.getByRole("link", { name: "View C-Audit on GitHub (opens in a new tab)" });
  await expect(githubLink).toHaveAttribute("href", "https://github.com/vimalselvarajan/C-Audit");
  await expect(githubLink).toHaveAttribute("target", "_blank");
  await expect(githubLink).toHaveAttribute("rel", "noopener noreferrer");
  await expect(cAudit.getByRole("link")).toHaveCount(1);

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


test("resume header keeps email, phone, and LinkedIn while omitting GitHub", async ({ page }) => {
  await page.goto("./resume/");

  const hero = page.locator(".resume-hero");
  const email = hero.getByRole("link", { name: "vimalselvarajan@gmail.com", exact: true });
  const phone = hero.getByRole("link", { name: "+1 (510) 598-5492", exact: true });
  const linkedin = hero.getByRole("link", { name: "LinkedIn", exact: true });

  await expect(email).toHaveAttribute("href", "mailto:vimalselvarajan@gmail.com");
  await expect(phone).toHaveAttribute("href", "tel:+15105985492");
  await expect(linkedin).toHaveAttribute("href", "https://www.linkedin.com/in/vimal-selvarajan/");
  await expect(linkedin).toHaveAttribute("target", "_blank");
  await expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
  await expect(hero.getByRole("link", { name: /GitHub/ })).toHaveCount(0);
});

test("resume presentation card links safely to the selected presentation", async ({ page }) => {
  await page.goto("./resume/");

  const presentation = page.locator("a.resume-presentation");
  await expect(presentation).toHaveAttribute("href", "https://lnkd.in/p/gm5TMYcZ");
  await expect(presentation).toHaveAttribute("target", "_blank");
  await expect(presentation).toHaveAttribute("rel", "noopener noreferrer");
  await expect(presentation).toContainText("Genome Assembly Optimization Using k-mer-Based Read Selection");
});
test("desktop career timeline maintains one active destination", async ({ page, isMobile }) => {
  test.skip(isMobile, "Desktop career index behavior");
  await page.goto("./resume/");

  const timeline = page.getByRole("navigation", { name: "Career timeline" });
  const lonardi = timeline.getByRole("link", { name: /Lonardi Lab/ });
  await expect(timeline.locator(".resume-timeline-index-rail")).toHaveCount(0);
  await expect(timeline.locator(".resume-timeline-index-progress")).toHaveCount(0);
  await expect(timeline.locator(".resume-timeline-index-marker")).toHaveCount(0);
  await expect(timeline.locator('[aria-current="location"]')).toHaveCount(1);
  await lonardi.click();

  await expect(page).toHaveURL(/#experience-lonardi-lab$/);
  await expect(lonardi).toHaveAttribute("aria-current", "location");
  await expect(timeline.locator('[aria-current="location"]')).toHaveCount(1);
});

test("mobile career timeline status follows the visible role", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile career timeline behavior");
  await page.goto("./resume/");

  await expect(page.locator(".resume-timeline-marker")).toHaveCount(4);
  await page.locator("#experience-lonardi-lab").evaluate((entry) => entry.scrollIntoView({ block: "start" }));
  await expect.poll(() => page.locator(".resume-timeline-status").getAttribute("data-active-timeline-label")).toBe("lonardi-lab");
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
