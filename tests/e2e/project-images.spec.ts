import { expect, test } from "@playwright/test";
import { readImageDimensions } from "../../lib/image-dimensions";

const buckConverterCandidates = [
  { width: 384, height: 274 },
  { width: 640, height: 457 },
  { width: 960, height: 686 },
  { width: 1622, height: 1159 },
] as const;


test("project details serve a right-sized responsive image set", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium verifies responsive source selection");
  await page.goto("./projects/12v-to-3v3-buck-converter/");

  const image = page.locator("article picture img");
  const source = page.locator('article picture source[type="image/webp"]');
  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute("src", "/Personal-Website/projects/12v-to-3v3-buck-converter.png");
  await expect(image).toHaveAttribute("width", "1622");
  await expect(image).toHaveAttribute("height", "1159");
  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).toHaveAttribute("decoding", "async");
  await expect(source).toHaveAttribute(
    "sizes",
    "(min-width: 1037px) 941px, (min-width: 640px) calc(100vw - 6rem), (min-width: 480px) calc(100vw - 3.5rem), 12rem",
  );

  const srcSet = await source.getAttribute("srcset");
  expect(srcSet).toBeTruthy();
  for (const candidate of buckConverterCandidates) {
    const filename = `12v-to-3v3-buck-converter-${candidate.width}.webp`;
    expect(srcSet, `${candidate.width}w candidate`).toContain(`${filename} ${candidate.width}w`);

    const response = await request.get(`./projects/responsive/${filename}`);
    expect(response.status(), filename).toBe(200);
    expect(response.headers()["content-type"] ?? "", filename).toContain("image/webp");
    const body = await response.body();
    expect(body.byteLength, filename).toBeLessThanOrEqual(200 * 1024);
    expect(readImageDimensions(body, filename)).toEqual(candidate);
  }

  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).currentSrc))
    .toMatch(/12v-to-3v3-buck-converter-960\.webp$/);
});

test("project index serves active responsive slides and only preloads above-fold media", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium verifies responsive source selection");
  await page.goto("./projects/");

  const cards = page.locator(`section[aria-label="Project index"] article picture:has(img[data-project-card-image])`);
  await expect(cards).toHaveCount(3);

  const hastestPreload = page.locator(
    'head link[rel="preload"][as="image"][type="image/avif"][imagesrcset*="hastest-control-suite-card-384.avif"]',
  );
  await expect(hastestPreload).toHaveCount(1);
  await expect(hastestPreload).toHaveAttribute(
    "imagesizes",
    "(min-width: 992px) 896px, (min-width: 640px) calc(100vw - 6rem), (min-width: 480px) calc(100vw - 3.5rem), 12rem",
  );
  await expect(hastestPreload).toHaveAttribute("fetchpriority", "high");
  await expect(page.locator(
    'head link[rel="preload"][as="image"][href*="12v-to-3v3-buck-converter"], head link[rel="preload"][as="image"][imagesrcset*="12v-to-3v3-buck-converter"]',
  )).toHaveCount(0);

  const hastestGallery = page.locator(
    `article[data-scene="hastest-control-suite"] [aria-label="Project image gallery"]`,
  );
  const hastestWebpSource = hastestGallery.locator('source[type="image/webp"]');
  const hastestAvifSource = hastestGallery.locator('source[type="image/avif"]');
  const imageButtons = hastestGallery.getByRole("button", { name: /^Show image / });
  const expectedResponsiveSlides = [
    "hastest-control-suite-384.webp 384w",
    "hastest-control-suite-gallery-0-384.webp 384w",
    "hastest-control-suite-gallery-1-384.webp 384w",
    "hastest-control-suite-gallery-2-384.webp 384w",
    "hastest-control-suite-gallery-3-384.webp 384w",
  ];

  await expect(imageButtons).toHaveCount(expectedResponsiveSlides.length);
  for (const [index, expectedCandidate] of expectedResponsiveSlides.entries()) {
    if (index > 0) {
      await imageButtons.nth(index).click();
    }
    await expect(imageButtons.nth(index)).toHaveAttribute("aria-current", "true");
    await expect(hastestGallery.locator(".project-carousel-slide")).toHaveCount(1);
    await expect(hastestWebpSource).toHaveCount(1);

    const sourceTypes = await hastestGallery.locator("picture source").evaluateAll(
      (sources) => sources.map((source) => source.getAttribute("type")),
    );
    expect(sourceTypes).toEqual(index === 0 ? ["image/avif", "image/webp"] : ["image/webp"]);
    if (index === 0) {
      await expect(hastestAvifSource).toHaveCount(1);
      await expect(hastestAvifSource).toHaveAttribute(
        "srcset",
        /hastest-control-suite-card-384\.avif 384w/,
      );
    } else {
      await expect(hastestAvifSource).toHaveCount(0);
    }

    const srcSet = await hastestWebpSource.getAttribute("srcset");
    expect(srcSet, `slide ${index + 1} responsive candidates`).toContain(expectedCandidate);
  }
  await expect(hastestWebpSource).not.toHaveAttribute("srcset", /hastest-control-suite-gallery-4-/);

  const responsiveAvifSources = await cards.locator('source[type="image/avif"]').evaluateAll(
    (elements) => elements.map((element) => element.getAttribute("srcset") ?? ""),
  );
  const responsiveWebpSources = await cards.locator('source[type="image/webp"]').evaluateAll(
    (elements) => elements.map((element) => element.getAttribute("srcset") ?? ""),
  );
  expect(responsiveAvifSources).toHaveLength(3);
  expect(responsiveWebpSources).toHaveLength(3);
  expect(responsiveAvifSources.every((source) => (
    /\/projects\/responsive\/[a-z0-9-]+-card-\d+\.avif/.test(source)
  ))).toBe(true);
  expect(responsiveWebpSources.every((source) => (
    /\/projects\/responsive\/[a-z0-9-]+-card-\d+\.webp/.test(source)
  ))).toBe(true);
});
