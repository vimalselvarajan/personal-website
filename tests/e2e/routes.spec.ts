import { expect, test, type Page } from "@playwright/test";
import { portfolioUrl } from "../../config/site";
import { readImageDimensions } from "../../lib/image-dimensions";
import { getSitemapPaths } from "./support";

const profileWidths = [384, 640, 768, 1024, 1280] as const;
const profileFormats = [
  { extension: "avif", contentType: "image/avif" },
  { extension: "webp", contentType: "image/webp" },
  { extension: "jpg", contentType: "image/jpeg" },
] as const;
const socialPreviewUrl = "https://vimalselvarajan.github.io/Personal-Website/social-preview.png";
const socialPreviewAlt = "Vimal Selvarajan portfolio preview";

async function expectNoHorizontalOverflow(page: Page, label: string) {
  const widths = await page.evaluate(() => {
    const client = document.documentElement.clientWidth;
    const offenders = [...document.body.querySelectorAll<HTMLElement>("*")]
      .map((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        const clientWidth = element.clientWidth;
        const scrollWidth = element.scrollWidth;
        return {
          element: [
            element.tagName.toLowerCase(),
            element.id ? `#${element.id}` : "",
            ...[...element.classList].slice(0, 3).map((name) => `.${name}`),
          ].join(""),
          left: Math.round(rect.left),
          right: Math.round(rect.right),
          width: Math.round(rect.width),
          clientWidth,
          scrollWidth,
          overflowX: style.overflowX,
        };
      })
      .filter(({ left, right, clientWidth, scrollWidth, overflowX }) =>
        left < -1
        || right > client + 1
        || (overflowX === "visible" && scrollWidth > clientWidth + 1),
      )
      .sort((first, second) => second.scrollWidth - first.scrollWidth)
      .slice(0, 8);

    return {
      client,
      scroll: Math.max(document.documentElement.scrollWidth, document.body.scrollWidth),
      offenders,
    };
  });
  expect(
    widths.scroll,
    `${label}; offenders: ${JSON.stringify(widths.offenders)}`,
  ).toBeLessThanOrEqual(widths.client + 1);
}

async function expectNonEmptyMetadata(page: Page, selector: string, label: string) {
  const content = await page.locator(selector).getAttribute("content");
  expect(content, label).toBeTruthy();
  return content ?? "";
}

test("all sitemap routes render as complete semantic pages", async ({ page, request }) => {
  for (const path of await getSitemapPaths(request)) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), path).toBe(200);
    await expect(page.locator("main"), `${path} main`).toHaveCount(1);
    await expect(page.locator("h1"), `${path} h1`).toHaveCount(1);
    await expectNoHorizontalOverflow(page, `${path} overflow`);
  }
});

test("every sitemap route exposes complete canonical and share metadata", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "One engine covers static metadata");
  test.setTimeout(120_000);

  for (const path of await getSitemapPaths(request)) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), path).toBe(200);

    const title = await page.title();
    expect(title.trim().length, `${path} title`).toBeGreaterThan(0);
    const description = await expectNonEmptyMetadata(
      page,
      'meta[name="description"]',
      `${path} description`,
    );

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    const expectedCanonical = new URL(path, `${portfolioUrl}/`).href;
    expect(canonical, `${path} canonical`).toBe(expectedCanonical);

    const openGraphTitle = await expectNonEmptyMetadata(
      page,
      'meta[property="og:title"]',
      `${path} Open Graph title`,
    );
    const openGraphDescription = await expectNonEmptyMetadata(
      page,
      'meta[property="og:description"]',
      `${path} Open Graph description`,
    );
    expect(openGraphDescription, `${path} Open Graph description parity`).toBe(description);
    await expect(page.locator('meta[property="og:url"]'), `${path} Open Graph URL`)
      .toHaveAttribute("content", expectedCanonical);
    const openGraphImage = await expectNonEmptyMetadata(page, 'meta[property="og:image"]', `${path} Open Graph image`);
    expect(openGraphImage, `${path} Open Graph image URL`).toBe(socialPreviewUrl);
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", socialPreviewAlt);

    await expect(page.locator('meta[name="twitter:card"]'), `${path} Twitter card`)
      .toHaveAttribute("content", "summary_large_image");
    await expect(page.locator('meta[name="twitter:title"]'), `${path} Twitter title`)
      .toHaveAttribute("content", openGraphTitle);
    await expect(page.locator('meta[name="twitter:description"]'), `${path} Twitter description`)
      .toHaveAttribute("content", description);
    const twitterImage = await expectNonEmptyMetadata(page, 'meta[name="twitter:image"]', `${path} Twitter image`);
    expect(twitterImage, `${path} Twitter image URL`).toBe(socialPreviewUrl);
    await expect(page.locator('meta[name="twitter:image:type"]')).toHaveAttribute("content", "image/png");
    await expect(page.locator('meta[name="twitter:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[name="twitter:image:height"]')).toHaveAttribute("content", "630");
    await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute("content", socialPreviewAlt);
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

  const socialPreview = await request.get("./social-preview.png");
  expect(socialPreview.status()).toBe(200);
  expect(socialPreview.headers()["content-type"]?.split(";", 1)[0]).toBe("image/png");
  expect(readImageDimensions(await socialPreview.body(), "social-preview.png"))
    .toEqual({ width: 1200, height: 630 });
  expect((await request.get("./opengraph-image")).status()).toBe(404);

  for (const asset of ["./robots.txt", "./sitemap.xml", "./icon.svg", "./projects/12v-to-3v3-buck-converter.png"]) {
    expect((await request.get(asset)).status(), asset).toBe(200);
  }
});

test("homepage portrait uses responsive modern sources and an LCP preload", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium verifies resource selection and preload semantics");
  await page.goto("./");

  const image = page.getByRole("img", { name: /^Portrait of / });
  const picture = page.locator("picture", { has: image });
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute("loading", "eager");
  await expect(image).toHaveAttribute("fetchpriority", "high");
  await expect(image).toHaveAttribute("decoding", "async");
  await expect(image).toHaveAttribute("width", "1280");
  await expect(image).toHaveAttribute("height", "960");

  for (const format of profileFormats) {
    const locator = format.extension === "jpg"
      ? image
      : picture.locator(`source[type="${format.contentType}"]`);
    const srcSet = await locator.getAttribute("srcset");
    expect(srcSet, `${format.extension} srcset`).toBeTruthy();
    for (const width of profileWidths) {
      expect(srcSet, `${format.extension} ${width}w candidate`)
        .toContain(`profile-${width}.${format.extension} ${width}w`);

      const filename = `profile-${width}.${format.extension}`;
      const response = await request.get(`./profile/${filename}`);
      expect(response.status(), filename).toBe(200);
      expect(response.headers()["content-type"] ?? "", filename).toContain(format.contentType);
      expect((await response.body()).byteLength, filename).toBeLessThanOrEqual(120 * 1024);
    }
  }

  const preload = page.locator(
    'link[rel="preload"][as="image"][type="image/avif"][imagesrcset*="/profile/profile-"]',
  );
  await expect(preload).toHaveCount(1);
  await expect(preload).toHaveAttribute("imagesizes", /352px/);
  await expect(preload).toHaveAttribute("imagesrcset", /profile-384\.avif 384w/);
  await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).currentSrc))
    .toMatch(/profile-384\.avif$/);
});

test("unknown paths use the portfolio 404", async ({ page }) => {
  for (const path of ["./not-a-real-route/", "./projects/combat-chess/"]) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(404);
    await expect(page.getByRole("heading", { name: /This path does not lead/ })).toBeVisible();
  }
});

test("Projects preloads the Hastest carousel while project cards remain lazy", async ({ page }) => {
  await page.goto("./projects/");

  const hastest = page.locator('section[aria-label="Project index"] article[data-scene="hastest-control-suite"]');
  const carouselImage = hastest.locator(".project-carousel-slide img");
  await expect(carouselImage).toBeVisible();
  await expect(carouselImage).toHaveAttribute("loading", "eager");
  await expect(carouselImage).toHaveAttribute("fetchpriority", "high");
  await expect(carouselImage).toHaveAttribute("decoding", "async");

  const hastestPreload = page.locator(
    'head link[rel="preload"][as="image"][type="image/avif"][imagesrcset*="hastest-control-suite-card-384.avif"]',
  );
  await expect(hastestPreload).toHaveCount(1);
  await expect(hastestPreload).toHaveAttribute("fetchpriority", "high");

  const cardImages = page.locator('section[aria-label="Project index"] img[data-project-card-image]');
  await expect(cardImages).toHaveCount(3);
  await expect(page.locator(
    'head link[rel="preload"][as="image"][imagesrcset*="12v-to-3v3-buck-converter-card-"]',
  )).toHaveCount(0);

  for (let index = 0; index < await cardImages.count(); index += 1) {
    const image = cardImages.nth(index);
    await expect(image).toHaveAttribute("loading", "lazy");
    await expect(image).toHaveAttribute("fetchpriority", "auto");
    await expect(image).toHaveAttribute("decoding", "async");
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate((element) => {
      const cardImage = element as HTMLImageElement;
      return cardImage.complete && cardImage.naturalWidth > 0;
    })).toBe(true);
  }

  const buckImage = cardImages.first();
  expect(await buckImage.evaluate((element) => element.getBoundingClientRect().width)).toBeLessThanOrEqual(608);
  expect(await buckImage.getAttribute("src")).toMatch(/^\/Personal-Website\/projects\//);
});

test("all sitemap routes reflow with enlarged text at 320px", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "One engine covers the narrow enlarged-text audit");
  test.setTimeout(120_000);
  await page.setViewportSize({ width: 320, height: 720 });

  for (const path of await getSitemapPaths(request)) {
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    expect(response?.status(), path).toBe(200);
    await page.locator("html").evaluate((element) => {
      element.style.fontSize = "200%";
    });
    await expectNoHorizontalOverflow(page, `${path} at 320px with 200% text`);
  }
});

test("the mobile dock remains viewport-contained in landscape", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "One engine covers the landscape geometry audit");
  await page.setViewportSize({ width: 667, height: 320 });
  await page.goto("./");

  const navigation = page.getByRole("navigation", { name: "Mobile primary" });
  await expect(navigation).toBeVisible();
  const box = await navigation.boundingBox();
  expect(box).not.toBeNull();
  if (!box) throw new Error("Mobile navigation has no layout box.");
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(668);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(321);

  const metrics = await navigation.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(metrics.scrollWidth).toBeLessThanOrEqual(metrics.clientWidth);
  await expectNoHorizontalOverflow(page, "landscape navigation overflow");
});

test("table-scroll CSS keeps an injected wide table locally scrollable at 320px", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "One engine covers table reflow geometry");
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("./projects/12v-to-3v3-buck-converter/");

  const prose = page.locator(".prose-portfolio");
  await expect(prose).toBeVisible();
  await prose.evaluate((container) => {
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";
    wrapper.dataset.testReflow = "true";
    wrapper.setAttribute("role", "group");
    wrapper.setAttribute("aria-label", "Scrollable table");
    wrapper.tabIndex = 0;
    wrapper.innerHTML = `<table><thead><tr><th>Signal</th><th>Identifier</th></tr></thead><tbody><tr><td>Feedback</td><td>${"buck_converter_feedback_signal_".repeat(8)}</td></tr></tbody></table>`;
    container.append(wrapper);
  });

  const wrapper = page.locator('[data-test-reflow="true"]');
  const dimensions = await wrapper.evaluate((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBeGreaterThan(dimensions.clientWidth);
  await wrapper.focus();
  await expect(wrapper).toBeFocused();
  await expectNoHorizontalOverflow(page, "wide table page overflow");
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
test("project archive titles remain visible and desktop scenes stay aligned", async ({ page }, testInfo) => {
  await page.goto("./projects/", { waitUntil: "networkidle" });

  const featuredTitles = page.locator('section[aria-label="Project index"] .atlas-scene-title');
  const compactEntries = page.locator('section[aria-label="Project index"] .project-compact-entry');
  await expect(featuredTitles).toHaveCount(2);
  await expect(featuredTitles).toHaveText([
    "Hastest DAC, DAQ, and Power Supply Control Suite",
    "+12V to +3V3 Buck Converter",
  ]);
  await expect(compactEntries).toHaveCount(2);
  await expect(compactEntries.getByRole("heading")).toHaveText([
    "Driver Interfaces",
    "Mini Genome Assembler",
  ]);
  const titleMetrics = await featuredTitles.evaluateAll((elements) => elements.map((element) => ({
    clientWidth: element.clientWidth,
    scrollWidth: element.scrollWidth,
  })));
  for (const { clientWidth, scrollWidth } of titleMetrics) {
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  }

  if (testInfo.project.name !== "chromium-desktop") return;

  const sceneHeights = await page.locator('section[aria-label="Project index"] .atlas-scene')
    .evaluateAll((elements) => elements.map((element) => element.getBoundingClientRect().height));
  expect(Math.max(...sceneHeights) - Math.min(...sceneHeights)).toBeLessThanOrEqual(24);
});
