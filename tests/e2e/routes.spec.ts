import { expect, test, type APIRequestContext } from "@playwright/test";

async function getSitemapPaths(request: APIRequestContext) {
  const response = await request.get("./sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  return [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
}

test("all sitemap routes render as complete semantic pages", async ({ page, request }) => {
  for (const path of await getSitemapPaths(request)) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("main"), `${path} main`).toHaveCount(1);
    await expect(page.locator("h1"), `${path} h1`).toHaveCount(1);
    expect(await page.locator("body").evaluate((body) => body.scrollWidth <= window.innerWidth), `${path} overflow`).toBe(true);
  }
});

test("metadata, public assets, and external link safety are correct", async ({ page, request }) => {
  await page.goto("./projects/12v-to-3v3-buck-converter/");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://vimalselvarajan.github.io/Personal-Website/projects/12v-to-3v3-buck-converter/");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "+12V to +3V3 Buck Converter");

  const externalLinks = page.locator('a[target="_blank"]');
  for (let index = 0; index < await externalLinks.count(); index += 1) {
    const rel = (await externalLinks.nth(index).getAttribute("rel"))?.split(/\s+/) ?? [];
    expect(rel).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
  }

  for (const asset of ["./robots.txt", "./sitemap.xml", "./opengraph-image", "./icon.svg", "./projects/power_supply.png"]) {
    expect((await request.get(asset)).status(), asset).toBe(200);
  }
});

test("unknown paths use the portfolio 404", async ({ page }) => {
  const response = await page.goto("./not-a-real-route/");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /This path does not lead/ })).toBeVisible();
});

test("responsive project images are lazy and container-capped", async ({ page }) => {
  await page.goto("./projects/");
  const firstImage = page.locator("article img").first();
  await expect(firstImage).toBeVisible();
  expect(await firstImage.getAttribute("loading")).toBe("eager");
  expect(await firstImage.getAttribute("fetchpriority")).toBe("high");
  expect(await firstImage.getAttribute("decoding")).toBe("sync");
  expect(await page.locator("article img").nth(1).getAttribute("loading")).toBe("lazy");
  expect(await page.locator("article img").nth(1).getAttribute("fetchpriority")).toBeNull();
  expect(await firstImage.evaluate((image) => image.getBoundingClientRect().width)).toBeLessThanOrEqual(608);
  expect(await firstImage.getAttribute("src")).toMatch(/^\/Personal-Website\/projects\//);
  const images = page.locator("article img");
  for (let index = 0; index < await images.count(); index += 1) {
    await images.nth(index).scrollIntoViewIfNeeded();
    await expect.poll(() => images.nth(index).evaluate((image) => {
      const img = image as HTMLImageElement;
      return img.complete && img.naturalWidth > 0;
    })).toBe(true);
  }
});

test("résumé content is readable without client JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto(new URL("resume/", baseURL).toString());
  await expect(page.getByRole("heading", { name: "Vimal Selvarajan", level: 1 })).toBeVisible();
  await expect(page.locator("[data-experience-id]")).toHaveCount(4);
  await expect(page.getByRole("heading", { name: "Hastest Solutions, Inc." })).toBeVisible();
  await context.close();
});
