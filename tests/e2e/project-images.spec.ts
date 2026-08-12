import { expect, test } from "@playwright/test";
import sharp from "sharp";
import { readImageDimensions } from "../../lib/image-dimensions";

const buckConverterCandidates = [
  { width: 384, height: 259 },
  { width: 640, height: 432 },
  { width: 960, height: 649 },
  { width: 1255, height: 848 },
] as const;

const combatChessCardCandidates = [
  { width: 384, height: 288 },
  { width: 608, height: 456 },
] as const;

test("project details serve a right-sized responsive image set", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium verifies responsive source selection");
  await page.goto("./projects/12v-to-3v3-buck-converter/");

  const image = page.locator("article picture img");
  const source = page.locator('article picture source[type="image/webp"]');
  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute("src", "/Personal-Website/projects/power_supply.png");
  await expect(image).toHaveAttribute("width", "1255");
  await expect(image).toHaveAttribute("height", "848");
  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).toHaveAttribute("decoding", "async");
  await expect(source).toHaveAttribute(
    "sizes",
    "(min-width: 1091px) 995px, (min-width: 640px) calc(100vw - 6rem), calc(100vw - 3.5rem)",
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
    .toMatch(/12v-to-3v3-buck-converter-1255\.webp$/);
});

test("project index serves distinct responsive card crops with a matching preload", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium verifies responsive source selection");
  await page.goto("./projects/");

  const cards = page.locator('section[aria-label="Project index"] article picture');
  await expect(cards).toHaveCount(5);

  const combatImage = page.locator('img[data-project-card-image="combat-chess"]');
  const combatAvifSource = page.locator(
    'picture:has(img[data-project-card-image="combat-chess"]) source[type="image/avif"]',
  );
  const combatWebpSource = page.locator(
    'picture:has(img[data-project-card-image="combat-chess"]) source[type="image/webp"]',
  );
  await expect(combatImage).toHaveAttribute(
    "src",
    "/Personal-Website/projects/combat_chess_card.webp",
  );
  await expect(combatImage).toHaveAttribute("loading", "eager");
  await expect(combatImage).toHaveAttribute("fetchpriority", "high");
  await expect(combatImage).toHaveAttribute("decoding", "sync");
  const cardSizes = [
    "(min-width: 1280px) 592px",
    "(min-width: 1024px) calc(50vw - 3rem)",
    "(min-width: 640px) calc(100vw - 4rem)",
    "calc(100vw - 2.5rem)",
  ].join(", ");
  await expect(combatAvifSource).toHaveAttribute("sizes", cardSizes);
  await expect(combatWebpSource).toHaveAttribute("sizes", cardSizes);

  const avifSrcSet = await combatAvifSource.getAttribute("srcset");
  const webpSrcSet = await combatWebpSource.getAttribute("srcset");
  expect(avifSrcSet).toContain("combat-chess-card-384.avif 384w");
  expect(avifSrcSet).toContain("combat-chess-card-608.avif 608w");
  expect(webpSrcSet).toContain("combat-chess-card-384.webp 384w");
  expect(webpSrcSet).toContain("combat-chess-card-608.webp 608w");
  expect(avifSrcSet).not.toContain("combat-chess-384.avif");
  expect(webpSrcSet).not.toContain("combat-chess-384.webp");

  const preload = page.locator(
    'head link[rel="preload"][as="image"][type="image/avif"][imagesrcset*="combat-chess-card-"]',
  );
  await expect(preload).toHaveCount(1);
  await expect(preload).toHaveAttribute("imagesrcset", avifSrcSet ?? "");
  await expect(preload).toHaveAttribute("imagesizes", cardSizes);
  await expect(preload).toHaveAttribute("fetchpriority", "high");

  for (const candidate of combatChessCardCandidates) {
    for (const format of ["avif", "webp"] as const) {
      const filename = `combat-chess-card-${candidate.width}.${format}`;
      const response = await request.get(`./projects/responsive/${filename}`);
      expect(response.status(), filename).toBe(200);
      expect(response.headers()["content-type"] ?? "", filename).toContain(`image/${format}`);
      const body = await response.body();
      expect(body.byteLength, filename).toBeLessThanOrEqual(120 * 1024);
      const metadata = await sharp(body).metadata();
      expect(
        {
          width: metadata.width,
          height: metadata.height,
          mediaType: metadata.mediaType ?? `image/${metadata.format}`,
        },
        filename,
      ).toEqual({ ...candidate, mediaType: `image/${format}` });
    }
  }

  await expect(combatImage).toBeVisible();
  await expect.poll(() => combatImage.evaluate((element) => (element as HTMLImageElement).currentSrc))
    .toMatch(/combat-chess-card-608\.avif$/);

  const responsiveAvifSources = await cards.locator('source[type="image/avif"]').evaluateAll(
    (elements) => elements.map((element) => element.getAttribute("srcset") ?? ""),
  );
  const responsiveWebpSources = await cards.locator('source[type="image/webp"]').evaluateAll(
    (elements) => elements.map((element) => element.getAttribute("srcset") ?? ""),
  );
  expect(responsiveAvifSources).toHaveLength(5);
  expect(responsiveWebpSources).toHaveLength(5);
  expect(responsiveAvifSources.every((source) => (
    /\/projects\/responsive\/[a-z0-9-]+-card-\d+\.avif/.test(source)
  ))).toBe(true);
  expect(responsiveWebpSources.every((source) => (
    /\/projects\/responsive\/[a-z0-9-]+-card-\d+\.webp/.test(source)
  ))).toBe(true);
});
