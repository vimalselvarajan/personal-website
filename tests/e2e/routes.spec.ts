import { expect, test, type Page } from "@playwright/test";
import { portfolioUrl, productionBasePath } from "../../config/site";
import { getSitemapPaths } from "./support";

const phoneViewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
] as const;

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const widths = await page.evaluate(() => ({ client: document.documentElement.clientWidth, scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) }));
  expect(widths.scroll, label).toBeLessThanOrEqual(widths.client + 1);
}

test("all sitemap routes render complete semantic pages", async ({ page, request }) => {
  for (const route of await getSitemapPaths(request)) {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response?.status(), route).toBe(200);
    await expect(page.locator("main"), route).toHaveCount(1);
    await expect(page.locator("h1"), route).toHaveCount(1);
    await expectNoHorizontalOverflow(page, route);
  }
});

test("phone routes preserve responsive chrome, clearance, targets, and theme", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-mobile", "One mobile engine covers the phone width matrix");
  await page.addInitScript(() => window.localStorage.setItem("theme", "dark"));
  const routes = await getSitemapPaths(request);

  for (const viewport of phoneViewports) {
    await page.setViewportSize(viewport);

    for (const route of routes) {
      await page.goto(route, { waitUntil: "domcontentloaded" });
      const routeLabel = `${route} at ${viewport.width}px`;
      await expectNoHorizontalOverflow(page, routeLabel);
      await expect(page.locator("html"), routeLabel).toHaveClass(/dark/);

      const dock = page.getByRole("navigation", { name: "Mobile primary" });
      await expect(dock.getByRole("link"), routeLabel).toHaveCount(4);

      const path = route
        .replace(productionBasePath, "")
        .replace(/\/$/, "") || "/";
      const expectedActive = path === "/"
        ? "Home"
        : path.startsWith("/projects")
          ? "Projects"
          : path.startsWith("/research")
            ? "Research"
            : path === "/resume"
              ? "Résumé navigation"
              : null;
      const activeLinks = dock.locator('[aria-current="page"]');
      await expect(activeLinks, routeLabel).toHaveCount(expectedActive ? 1 : 0);
      if (expectedActive) {
        await expect(dock.getByRole("link", { name: expectedActive, exact: true }), routeLabel)
          .toHaveAttribute("aria-current", "page");
      }

      const undersizedTargets = await page
        .locator([
          ".site-header a",
          ".site-header button",
          ".site-footer a",
          "main button",
          "main a:not(.landing-copy a):not(.prose-portfolio a)",
        ].join(","))
        .evaluateAll((elements) => elements.flatMap((element) => {
          const bounds = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          if (style.display === "none" || style.visibility === "hidden" || bounds.width === 0 || bounds.height === 0) {
            return [];
          }
          if (bounds.width >= 44 && bounds.height >= 44) return [];
          return [{
            label: element.getAttribute("aria-label") || element.textContent?.trim().slice(0, 80) || element.tagName,
            width: Math.round(bounds.width * 10) / 10,
            height: Math.round(bounds.height * 10) / 10,
          }];
        }));
      expect(undersizedTargets, routeLabel).toEqual([]);

      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      await page.waitForTimeout(50);
      const clearance = await page.evaluate(() => {
        const dock = document.querySelector(".mobile-nav-dock-surface");
        const footer = document.querySelector<HTMLElement>("#site-footer");
        const main = document.querySelector<HTMLElement>("main");
        const finalContent = footer && getComputedStyle(footer).display !== "none" ? footer : main;
        if (!dock || !finalContent) return null;
        return dock.getBoundingClientRect().top - finalContent.getBoundingClientRect().bottom;
      });
      expect(clearance, routeLabel).not.toBeNull();
      expect(clearance ?? 0, routeLabel).toBeGreaterThanOrEqual(8);
    }
  }
});

test("sitemap routes expose canonical metadata", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "One engine covers static metadata");
  for (const route of await getSitemapPaths(request)) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const expectedCanonical = new URL(route, portfolioUrl + "/").href;
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", expectedCanonical);
    await expect(page.locator("meta[name=description]")).toHaveAttribute("content", /.+/);
  }
});

test("public assets and static metadata files are available", async ({ request }) => {
  for (const asset of ["./robots.txt", "./sitemap.xml", "./assets/icons/site-icon.svg", "./assets/images/research/originals/mtp-lite-genome-assembly-poster.jpg"]) {
    expect((await request.get(asset)).status(), asset).toBe(200);
  }
});

test("unknown paths use the portfolio 404", async ({ page }) => {
  for (const route of ["./projects/missing/", "./not-a-real-route/"]) {
    const response = await page.goto(route);
    expect(response?.status(), route).toBe(404);
    await expect(page.getByRole("heading", { name: /This path does not lead/ })).toBeVisible();
  }
});
