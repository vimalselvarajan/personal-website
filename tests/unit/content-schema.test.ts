import { describe, expect, it } from "vitest";
import { projectFrontmatterSchema, researchFrontmatterSchema } from "@/lib/content-schema";

const validProject = {
  title: "Project",
  slug: "project",
  summary: "Summary",
  order: 1,
  stack: ["TypeScript"],
  github: "https://github.com/example/project",
  image: "/projects/project.png",
  imageAlt: "Project screenshot",
  imageWidth: 800,
  imageHeight: 600,
};

describe("content schemas", () => {
  it("accepts valid project frontmatter", () => {
    expect(projectFrontmatterSchema.parse(validProject)).toEqual(validProject);
  });

  it("accepts an optional primary image caption", () => {
    const imageCaption = "Project overview";

    expect(projectFrontmatterSchema.parse({ ...validProject, imageCaption }))
      .toEqual({ ...validProject, imageCaption });
  });

  it.each([
    ["non-kebab slug", { slug: "Not Valid" }],
    ["empty stack item", { stack: ["TypeScript", " "] }],
    ["non-GitHub URL", { github: "https://example.com/project" }],
    ["non-positive dimensions", { imageWidth: 0 }],
    ["empty primary image caption", { imageCaption: " " }],
    ["unknown field", { unexpected: true }],
  ])("rejects %s", (_label, override) => {
    expect(projectFrontmatterSchema.safeParse({ ...validProject, ...override }).success).toBe(false);
  });

  it("requires a nonempty research tool list", () => {
    expect(researchFrontmatterSchema.safeParse({
      title: "Research",
      slug: "research",
      summary: "Summary",
      order: 1,
      status: "Ongoing",
      researchArea: "Systems",
      tools: [],
      affiliation: "Lab",
    }).success).toBe(false);
  });
});
