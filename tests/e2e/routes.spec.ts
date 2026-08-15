import { expect, test, type Page } from "@playwright/test";
import { portfolioUrl } from "../../config/site";
import { getSitemapPaths } from "./support";

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

test("sitemap routes expose canonical metadata", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "One engine covers static metadata");
  for (const route of await getSitemapPaths(request)) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const expectedCanonical = new URL(route, portfolioUrl + "/").href;
    await expect(page.locator("link[rel=canonical]")).toHaveAttribute("href", expectedCanonical);
    await expect(page.locator("meta[name=description]")).toHaveAttribute("content", /.+/);
  }
});

test("public research assets and static metadata files are available", async ({ request }) => {
  for (const asset of ["./robots.txt", "./sitemap.xml", "./icon.svg", "./research/mtp-lite-genome-assembly-poster.jpg"]) {
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
