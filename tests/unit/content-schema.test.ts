import { describe, expect, it } from "vitest";
import { researchFrontmatterSchema } from "@/lib/content-schema";

const validResearch = {
  title: "Research",
  slug: "research",
  summary: "Summary",
  order: 1,
  status: "Ongoing",
  researchArea: "Systems",
  tools: ["TypeScript"],
  affiliation: "Lab",
};

describe("content schemas", () => {
  it("requires a nonempty research tool list", () => {
    expect(researchFrontmatterSchema.safeParse({ ...validResearch, tools: [] }).success).toBe(false);
  });

  it("accepts complete optional research image metadata", () => {
    const image = { image: "/assets/images/research/originals/poster.jpg", imageAlt: "Research poster", imageWidth: 2500, imageHeight: 1875 };
    expect(researchFrontmatterSchema.parse({ ...validResearch, ...image })).toEqual({ ...validResearch, ...image });
  });

  it.each([
    ["partial image metadata", { image: "/assets/images/research/originals/poster.jpg", imageAlt: "Research poster", imageWidth: 2500 }],
    ["an image outside the research directory", { image: "/other/poster.jpg", imageAlt: "Research poster", imageWidth: 2500, imageHeight: 1875 }],
    ["unknown field", { unexpected: true }],
  ])("rejects %s", (_label, image) => {
    expect(researchFrontmatterSchema.safeParse({ ...validResearch, ...image }).success).toBe(false);
  });
});
