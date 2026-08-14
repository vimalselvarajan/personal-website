import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";
import { getSitemapPaths } from "./support";

function normalizedViolations(results: Awaited<ReturnType<AxeBuilder["analyze"]>>) {
  return results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    targets: violation.nodes.map((node) => node.target),
  }));
}

async function expectHastestCarouselGeometry(gallery: Locator) {
  const metrics = await gallery.locator(".project-carousel-stage").evaluate((stage) => {
    const bounds = stage.getBoundingClientRect();
    const image = stage.querySelector("img");

    return {
      ratio: bounds.width / bounds.height,
      objectFit: image ? getComputedStyle(image).objectFit : null,
      objectPosition: image ? getComputedStyle(image).objectPosition : null,
    };
  });

  expect(metrics.ratio).toBeCloseTo(4 / 3, 1);
  expect(metrics.objectFit).toBe("cover");
  expect(metrics.objectPosition).toBe("50% 50%");
}

async function expectCarouselTouchTargets(gallery: Locator) {
  const targetSizes = await gallery.getByRole("button").evaluateAll((buttons) => buttons.map((button) => {
    const bounds = button.getBoundingClientRect();

    return {
      label: button.getAttribute("aria-label"),
      width: bounds.width,
      height: bounds.height,
    };
  }));
  const undersizedTargets = targetSizes.filter(({ width, height }) => width < 44 || height < 44);

  expect(undersizedTargets).toEqual([]);
}

async function dispatchTouchDrag(
  stage: Locator,
  delta: { x: number; y: number },
  pointerId: number,
) {
  const bounds = await stage.boundingBox();
  if (!bounds) {
    throw new Error("Carousel stage must be visible before dragging");
  }

  const start = {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
  const pointer = {
    bubbles: true,
    composed: true,
    isPrimary: true,
    pointerId,
    pointerType: "touch",
  };

  await stage.dispatchEvent("pointerdown", {
    ...pointer,
    button: 0,
    buttons: 1,
    clientX: start.x,
    clientY: start.y,
  });
  for (const progress of [0.5, 1]) {
    await stage.dispatchEvent("pointermove", {
      ...pointer,
      button: -1,
      buttons: 1,
      clientX: start.x + delta.x * progress,
      clientY: start.y + delta.y * progress,
    });
  }
  await stage.dispatchEvent("pointerup", {
    ...pointer,
    button: 0,
    buttons: 0,
    clientX: start.x + delta.x,
    clientY: start.y + delta.y,
  });
}

async function installViewTransitionProbe(page: Page) {
  await page.addInitScript(() => {
    const probe = {
      calls: 0,
      durations: [] as number[],
      ready: false,
      supported: Boolean(document.startViewTransition),
    };
    Reflect.set(window, "__portfolioViewTransitionProbe", probe);
    if (!document.startViewTransition) return;

    const originalStartViewTransition = document.startViewTransition.bind(document);
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      value: (update: Parameters<Document["startViewTransition"]>[0]) => {
        probe.calls += 1;
        probe.durations = [];
        probe.ready = false;

        const transition = originalStartViewTransition(update);
        void transition.ready.then(() => {
          const durations = document.getAnimations().flatMap((animation) => {
            const effect = animation.effect;
            if (!(effect instanceof KeyframeEffect) || !effect.pseudoElement?.startsWith("::view-transition")) {
              return [];
            }

            const duration = effect.getComputedTiming().duration;
            return typeof duration === "number" ? [duration] : [];
          });
          probe.durations = durations;
          probe.ready = true;
        });
        return transition;
      },
    });
  });
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

test("the home primary CTA jumps to selected work", async ({ page }) => {
  await page.goto("./");
  await page.getByRole("link", { name: "View selected work" }).click();

  await expect(page).toHaveURL(/#selected-work$/);
  await expect(page.locator("#selected-work")).toBeInViewport();
  await expect(page.getByRole("heading", { name: "Engineering with evidence behind it." })).toBeVisible();
});

test("nested work routes keep their collection tab active", async ({ page, isMobile }) => {
  const navigationName = isMobile ? "Mobile primary" : "Primary";

  for (const entry of [
    { path: "./projects/hastest-control-suite/", label: "Projects" },
    { path: "./research/optimal-read-selection/", label: "Research" },
  ]) {
    await page.goto(entry.path);
    const navigation = page.getByRole("navigation", { name: navigationName });
    await expect(navigation).toBeVisible();
    await expect(navigation.getByRole("link", { name: entry.label, exact: true }))
      .toHaveAttribute("aria-current", "page");
  }
});

test("mobile dock is keyboard-accessible and tracks the current route", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Mobile navigation behavior");
  await page.goto("./");

  const dock = page.getByRole("navigation", { name: "Mobile primary" });
  const home = dock.getByRole("link", { name: "Home", exact: true });
  const projects = dock.getByRole("link", { name: "Projects", exact: true });

  await expect(dock).toBeVisible();
  await expect(home).toHaveAttribute("aria-current", "page");
  await projects.focus();
  await expect(projects).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(page).toHaveURL(/\/projects\/$/);
  await expect(dock.getByRole("link", { name: "Projects", exact: true })).toHaveAttribute("aria-current", "page");
});

test("an explicit light theme persists across desktop and mobile navigation", async ({ page, isMobile }) => {
  await page.addInitScript(() => window.localStorage.removeItem("theme"));
  await page.goto("./");
  await page.getByRole("button", { name: /Theme: system/ }).click();
  await expect(page.locator("html")).toHaveClass(/light/);

  if (isMobile) {
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

test("Hastest project gallery responds to controls and keyboard navigation", async ({ page }) => {
  await page.goto("./projects/hastest-control-suite/");

  const gallery = page.getByRole("region", { name: "Project image gallery" });
  await expect(gallery.getByRole("button", { name: /^Show image / })).toHaveCount(5);
  await expectHastestCarouselGeometry(gallery);
  await expectCarouselTouchTargets(gallery);
  await expect(gallery.getByRole("img", { name: /Overhead view of the HTOL fixture/ })).toBeVisible();
  await expect(gallery.getByText("HTOL fixture overview", { exact: true })).toBeVisible();
  await expect(gallery.getByRole("img", { name: /DAC and current-sense PCBA/ })).toHaveCount(0);

  await gallery.getByRole("button", { name: "Next image" }).click();
  await expect(gallery.getByRole("img", { name: /HTOL test hardware/ })).toBeVisible();

  await gallery.focus();
  await page.keyboard.press("End");
  await expect(gallery.getByRole("img", { name: /Keysight DAQ973A/ })).toBeVisible();
});

test("mobile project gallery distinguishes horizontal swipes from vertical gestures", async ({ page, isMobile }) => {
  test.skip(!isMobile, "Touch gesture behavior");
  await page.goto("./projects/hastest-control-suite/");

  const gallery = page.getByRole("region", { name: "Project image gallery" });
  const stage = gallery.locator(".project-carousel-stage");
  const firstImage = gallery.getByRole("img", { name: /Overhead view of the HTOL fixture/ });
  const secondImage = gallery.getByRole("img", { name: /HTOL test hardware/ });
  const touchAction = await stage.evaluate((element) => getComputedStyle(element).touchAction);

  expect(touchAction).toContain("pan-y");
  expect(touchAction).toContain("pinch-zoom");
  await expect(firstImage).toBeVisible();

  await dispatchTouchDrag(stage, { x: 8, y: -96 }, 41);
  await expect(firstImage).toBeVisible();

  await dispatchTouchDrag(stage, { x: -120, y: 4 }, 42);
  await expect(secondImage).toBeVisible();
});

test("Projects page includes the Hastest project gallery", async ({ page }) => {
  await page.goto("./projects/");

  const project = page.locator('section[aria-label="Project index"] article[data-scene="hastest-control-suite"]');
  await expect(project.getByRole("heading", { name: "Hastest DAC, DAQ, and Power Supply Control Suite" })).toBeVisible();
  await expect(project.getByRole("link", { name: "Project details" }))
    .toHaveAttribute("href", new RegExp("projects/hastest-control-suite/$"));

  const gallery = project.getByRole("region", { name: "Project image gallery" });
  await expect(gallery.getByRole("button", { name: /^Show image / })).toHaveCount(5);
  await expectHastestCarouselGeometry(gallery);
  await expect(gallery.getByRole("img", { name: /Overhead view of the HTOL fixture/ })).toBeVisible();
  await expect(gallery.getByText("HTOL fixture overview", { exact: true })).toBeVisible();
  await expect(gallery.getByRole("img", { name: /DAC and current-sense PCBA/ })).toHaveCount(0);

  await gallery.getByRole("button", { name: "Next image" }).click();
  await expect(gallery.getByRole("img", { name: /HTOL test hardware/ })).toBeVisible();

  await gallery.focus();
  await page.keyboard.press("End");
  await expect(gallery.getByRole("img", { name: /Keysight DAQ973A/ })).toBeVisible();
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

test("Chromium safe-area insets clear the header, content, and mobile dock", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium exposes safe-area emulation through CDP");
  await page.setViewportSize({ width: 390, height: 844 });

  const session = await page.context().newCDPSession(page);
  const send = session.send.bind(session) as (method: string, params?: unknown) => Promise<unknown>;
  const insets = { top: 24, right: 28, bottom: 30, left: 36 };
  await send("Emulation.setSafeAreaInsetsOverride", { insets });
  await page.goto("./");

  const geometry = await page.evaluate(() => {
    const headerSurface = document.querySelector<HTMLElement>(".glass-nav")?.getBoundingClientRect();
    const contentContainer = document.querySelector<HTMLElement>("main .app-container");
    const dock = document.querySelector<HTMLElement>(".mobile-nav-dock")?.getBoundingClientRect();
    const contentStyle = contentContainer ? getComputedStyle(contentContainer) : null;

    return {
      headerSurface: headerSurface && {
        top: headerSurface.top,
        left: headerSurface.left,
        right: headerSurface.right,
      },
      contentPadding: contentStyle && {
        left: Number.parseFloat(contentStyle.paddingLeft),
        right: Number.parseFloat(contentStyle.paddingRight),
      },
      dock: dock && {
        left: dock.left,
        right: dock.right,
        bottom: dock.bottom,
      },
      viewport: { width: innerWidth, height: innerHeight },
    };
  });

  expect(geometry.headerSurface).not.toBeNull();
  expect(geometry.contentPadding).not.toBeNull();
  expect(geometry.dock).not.toBeNull();
  expect(geometry.headerSurface?.top).toBeGreaterThanOrEqual(insets.top);
  expect(geometry.headerSurface?.left).toBeGreaterThanOrEqual(insets.left);
  expect(geometry.headerSurface?.right).toBeLessThanOrEqual(geometry.viewport.width - insets.right);
  expect(geometry.contentPadding?.left).toBeGreaterThanOrEqual(insets.left);
  expect(geometry.contentPadding?.right).toBeGreaterThanOrEqual(insets.right);
  expect(geometry.dock?.left).toBeGreaterThanOrEqual(insets.left);
  expect(geometry.dock?.right).toBeLessThanOrEqual(geometry.viewport.width - insets.right);
  expect(geometry.dock?.bottom).toBeLessThanOrEqual(geometry.viewport.height - insets.bottom);
});

test("reduced transparency removes blur from navigation materials", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium exposes custom media emulation through CDP");
  await page.setViewportSize({ width: 390, height: 844 });

  const session = await page.context().newCDPSession(page);
  await session.send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-transparency", value: "reduce" }],
  });
  await page.goto("./");

  await expect.poll(() => page.evaluate(() => matchMedia("(prefers-reduced-transparency: reduce)").matches))
    .toBe(true);
  const filters = await page.locator(".glass-nav, .mobile-nav-dock-surface").evaluateAll((elements) => elements.map((element) => {
    const style = getComputedStyle(element);
    return style.backdropFilter;
  }));
  expect(filters).toEqual(["none", "none"]);
});

test("route transitions activate and reduced motion removes their duration", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium covers the native view-transition path");

  await installViewTransitionProbe(page);
  const readProbe = () => page.evaluate(() => Reflect.get(window, "__portfolioViewTransitionProbe") as {
    calls: number;
    durations: number[];
    ready: boolean;
    supported: boolean;
  } | undefined);

  for (const reducedMotion of ["no-preference", "reduce"] as const) {
    await page.emulateMedia({ reducedMotion });
    await page.goto("./");
    test.skip(!(await readProbe())?.supported, "Native view transitions are not supported");
    await page.getByRole("link", { name: "Explore the platform" }).click();
    await expect(page).toHaveURL(/\/projects\/hastest-control-suite\/$/);

    await expect.poll(async () => (await readProbe())?.calls ?? 0).toBeGreaterThan(0);
    await expect.poll(async () => (await readProbe())?.ready ?? false).toBe(true);
    const probe = await readProbe();
    expect(probe).toBeDefined();
    const durations = probe?.durations ?? [];

    if (reducedMotion === "reduce") {
      expect(durations.every((duration) => duration === 0)).toBe(true);
    } else {
      expect(durations).not.toEqual([]);
      expect(durations.some((duration) => duration > 0)).toBe(true);
    }
  }
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

test("the mobile dock has no accessibility violations in either theme", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-mobile", "Chromium mobile covers the dock state");
  test.setTimeout(60_000);
  await page.goto("./");

  for (const theme of ["light", "dark"] as const) {
    await page.evaluate((selectedTheme) => window.localStorage.setItem("theme", selectedTheme), theme);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.locator("html")).toHaveClass(new RegExp(theme));
    await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(normalizedViolations(results), `${theme} mobile dock`).toEqual([]);
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

  await expect(page.getByRole("navigation", { name: "Mobile primary" })).toBeVisible();
  const overflow = await page.evaluate(() => ({
    client: document.documentElement.clientWidth,
    scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
  }));
  expect(overflow.scroll).toBeLessThanOrEqual(overflow.client + 1);
});
