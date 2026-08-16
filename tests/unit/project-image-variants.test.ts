import { describe, expect, it } from "vitest";
import {
  getProjectCardImageSizes,
  getProjectCardImageVariantPath,
  getProjectCardImageVariantWidths,
  getProjectGalleryImageVariantPath,
  getProjectImageSizes,
  getProjectImageVariantPath,
  getProjectImageVariantWidths,
} from "@/lib/project-image-variants";

describe("project image variants", () => {
  it("builds a compact candidate set ending at the source width", () => {
    expect(getProjectImageVariantWidths(1255)).toEqual([384, 640, 960, 1255]);
    expect(getProjectImageVariantWidths(559)).toEqual([384, 559]);
    expect(getProjectImageVariantWidths(384)).toEqual([384]);
  });

  it("keeps card density targets separate from detail-image candidates", () => {
    expect(getProjectCardImageVariantWidths(1255)).toEqual([384, 672, 960, 1255]);
    expect(getProjectCardImageVariantWidths(2500)).toEqual([384, 672, 960, 1280]);
    expect(getProjectCardImageVariantWidths(800)).toEqual([384, 672, 800]);
    expect(getProjectCardImageVariantWidths(608)).toEqual([384, 608]);
  });

  it("derives stable, base-path-independent asset paths", () => {
    expect(getProjectImageVariantPath("12v-to-3v3-buck-converter", 640))
      .toBe("/projects/responsive/12v-to-3v3-buck-converter-640.webp");
    expect(getProjectGalleryImageVariantPath("hastest-control-suite", 2, 960))
      .toBe("/projects/responsive/hastest-control-suite-gallery-2-960.webp");
  });

  it("keeps card crops in a collision-free responsive asset namespace", () => {
    expect(getProjectCardImageVariantPath("driver-interfaces", 384, "avif"))
      .toBe("/projects/responsive/driver-interfaces-card-384.avif");
    expect(getProjectCardImageVariantPath("driver-interfaces", 384, "webp"))
      .toBe("/projects/responsive/driver-interfaces-card-384.webp");
    expect(getProjectCardImageVariantPath("driver-interfaces", 384, "webp"))
      .not.toBe(getProjectImageVariantPath("driver-interfaces", 384));
  });

  it("models project-index card widths at each layout breakpoint", () => {
    expect(getProjectCardImageSizes()).toBe(
      "(min-width: 1280px) 592px, (min-width: 1024px) calc(50vw - 3rem), "
      + "(min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)",
    );
  });

  it("models the current container padding and 42rem height cap in sizes", () => {
    expect(getProjectImageSizes(1622, 1159)).toBe(
      "(min-width: 1037px) 941px, (min-width: 640px) calc(100vw - 6rem), (min-width: 480px) calc(100vw - 3.5rem), 12rem",
    );
    expect(getProjectImageSizes(559, 488)).toBe(
      "(min-width: 655px) 559px, (min-width: 640px) calc(100vw - 6rem), (min-width: 480px) calc(100vw - 3.5rem), 12rem",
    );
  });

  it.each([
    [0, 100],
    [100, 0],
    [100.5, 100],
  ])("rejects invalid source dimensions %s x %s", (width, height) => {
    expect(() => getProjectImageSizes(width, height)).toThrow(/positive integer/);
  });

  it("rejects unsafe slugs and invalid candidate widths", () => {
    expect(() => getProjectImageVariantPath("../escape", 640)).toThrow(/lowercase kebab-case/);
    expect(() => getProjectGalleryImageVariantPath("../escape", 0, 640)).toThrow(/lowercase kebab-case/);
    expect(() => getProjectCardImageVariantPath("../escape", 672, "avif")).toThrow(/lowercase kebab-case/);
    expect(() => getProjectImageVariantPath("project", -1)).toThrow(/positive integer/);
    expect(() => getProjectGalleryImageVariantPath("project", 0, -1)).toThrow(/positive integer/);
    expect(() => getProjectCardImageVariantPath("project", -1, "webp")).toThrow(/positive integer/);
    expect(() => getProjectCardImageVariantPath("project", 384, "png" as never)).toThrow(/avif or webp/);
    expect(() => getProjectImageVariantWidths(0)).toThrow(/positive integer/);
    expect(() => getProjectCardImageVariantWidths(0)).toThrow(/positive integer/);
  });

  it.each([-1, 1.5])("rejects invalid gallery indexes: %s", (index) => {
    expect(() => getProjectGalleryImageVariantPath("project", index, 640))
      .toThrow(/non-negative integer/);
  });
});
