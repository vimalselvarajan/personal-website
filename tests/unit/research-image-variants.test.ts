import { describe, expect, it } from "vitest";
import {
  getResearchImageVariantPath,
  getResearchImageVariantWidths,
} from "@/lib/research-image-variants";

describe("research image variants", () => {
  it("builds a candidate set that covers the rendered research poster width", () => {
    expect(getResearchImageVariantWidths(2500)).toEqual([384, 640, 960, 1280, 2500]);
    expect(getResearchImageVariantWidths(1280)).toEqual([384, 640, 960, 1280]);
    expect(getResearchImageVariantWidths(960)).toEqual([384, 640, 960]);
    expect(getResearchImageVariantWidths(384)).toEqual([384]);
  });

  it("derives stable, base-path-independent research asset paths", () => {
    expect(getResearchImageVariantPath("optimal-read-selection", 1280))
      .toBe("/research/responsive/optimal-read-selection-1280.webp");
  });

  it.each([0, -1, 1.5])("rejects invalid source dimensions: %s", (width) => {
    expect(() => getResearchImageVariantWidths(width)).toThrow(/positive integer/);
  });

  it("rejects unsafe slugs and invalid candidate widths", () => {
    expect(() => getResearchImageVariantPath("../escape", 1280)).toThrow(/lowercase kebab-case/);
    expect(() => getResearchImageVariantPath("research", 0)).toThrow(/positive integer/);
  });
});
