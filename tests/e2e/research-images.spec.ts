import { expect, test } from "@playwright/test";
import { readImageDimensions } from "../../lib/image-dimensions";

const mtpLiteCandidates = [
  { width: 384, height: 288 },
  { width: 640, height: 480 },
  { width: 960, height: 720 },
  { width: 1280, height: 960 },
  { width: 2500, height: 1875 },
] as const;

test("research details serve a right-sized responsive image set", async ({ page, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium-desktop", "Chromium verifies responsive source selection");
  await page.goto("./research/optimal-read-selection/");

  const image = page.locator("article picture img");
  const mobileSource = page.locator('article picture source[type="image/webp"][media]');
  const source = page.locator('article picture source[type="image/webp"]:not([media])');
  await expect(image).toHaveCount(1);
  await expect(image).toHaveAttribute("src", "/Personal-Website/research/mtp-lite-genome-assembly-poster.jpg");
  await expect(image).toHaveAttribute("width", "2500");
  await expect(image).toHaveAttribute("height", "1875");
  await expect(image).toHaveAttribute("loading", "lazy");
  await expect(image).toHaveAttribute("decoding", "async");
  await expect(mobileSource).toHaveAttribute("media", "(max-width: 479px)");
  await expect(mobileSource).toHaveAttribute("srcset", /optimal-read-selection-384\.webp/);
  await expect(source).toHaveAttribute(
    "sizes",
    "(min-width: 1280px) 1120px, calc(100vw - 4rem)",
  );

  const srcSet = await source.getAttribute("srcset");
  expect(srcSet).toBeTruthy();
  for (const candidate of mtpLiteCandidates) {
    const filename = "optimal-read-selection-" + candidate.width + ".webp";
    expect(srcSet, candidate.width + "w candidate").toContain(filename + " " + candidate.width + "w");

    const response = await request.get("./research/responsive/" + filename);
    expect(response.status(), filename).toBe(200);
    expect(response.headers()["content-type"] ?? "", filename).toContain("image/webp");
    const body = await response.body();
    expect(body.byteLength, filename).toBeLessThanOrEqual(200 * 1024);
    expect(readImageDimensions(body, filename)).toEqual(candidate);
  }

  await image.scrollIntoViewIfNeeded();
  await expect(image).toBeVisible();
  await expect.poll(() => image.evaluate((element) => (element as HTMLImageElement).currentSrc))
    .toMatch(/optimal-read-selection-1280\.webp$/);
});
