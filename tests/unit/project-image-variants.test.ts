import { describe, expect, it } from "vitest";
import {
  getProjectCardImageSizes,
  getProjectCardImageVariantPath,
  getProjectCardImageVariantWidths,
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
    expect(getProjectCardImageVariantWidths(800)).toEqual([384, 672, 800]);
    expect(getProjectCardImageVariantWidths(608)).toEqual([384, 608]);
  });

  it("derives stable, base-path-independent asset paths", () => {
    expect(getProjectImageVariantPath("12v-to-3v3-buck-converter", 640))
      .toBe("/projects/responsive/12v-to-3v3-buck-converter-640.webp");
  });

  it("keeps card crops in a collision-free responsive asset namespace", () => {
    expect(getProjectCardImageVariantPath("combat-chess", 384, "avif"))
      .toBe("/projects/responsive/combat-chess-card-384.avif");
    expect(getProjectCardImageVariantPath("combat-chess", 384, "webp"))
      .toBe("/projects/responsive/combat-chess-card-384.webp");
    expect(getProjectCardImageVariantPath("combat-chess", 384, "webp"))
      .not.toBe(getProjectImageVariantPath("combat-chess", 384));
  });

  it("models project-index card widths at each layout breakpoint", () => {
    expect(getProjectCardImageSizes()).toBe(
      "(min-width: 1280px) 592px, (min-width: 1024px) calc(50vw - 3rem), "
      + "(min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)",
    );
  });

  it("models the current container padding and 42rem height cap in sizes", () => {
    expect(getProjectImageSizes(1255, 848)).toBe(
      "(min-width: 1091px) 995px, (min-width: 640px) calc(100vw - 6rem), calc(100vw - 3.5rem)",
    );
    expect(getProjectImageSizes(559, 488)).toBe(
      "(min-width: 655px) 559px, (min-width: 640px) calc(100vw - 6rem), calc(100vw - 3.5rem)",
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
    expect(() => getProjectCardImageVariantPath("../escape", 672, "avif")).toThrow(/lowercase kebab-case/);
    expect(() => getProjectImageVariantPath("project", -1)).toThrow(/positive integer/);
    expect(() => getProjectCardImageVariantPath("project", -1, "webp")).toThrow(/positive integer/);
    expect(() => getProjectImageVariantWidths(0)).toThrow(/positive integer/);
    expect(() => getProjectCardImageVariantWidths(0)).toThrow(/positive integer/);
  });
});
