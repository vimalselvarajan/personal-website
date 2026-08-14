import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createContentRepository } from "@/lib/content-repository";
import { contentSchemas } from "@/lib/content-schema";

const temporaryDirectories: string[] = [];

function makeRepository(files: Record<string, string>, kind: "projects" | "research" = "research") {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-content-test-"));
  temporaryDirectories.push(root);
  const contentRoot = path.join(root, "content", kind);
  fs.mkdirSync(contentRoot, { recursive: true });
  for (const [filename, source] of Object.entries(files)) fs.writeFileSync(path.join(contentRoot, filename), source);

  const imageRoot = path.join(root, "public", "projects");
  fs.mkdirSync(imageRoot, { recursive: true });
  fs.writeFileSync(
    path.join(imageRoot, "fixture.png"),
    Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z9S8AAAAASUVORK5CYII=", "base64"),
  );
  return createContentRepository({ contentRoot: path.join(root, "content"), publicRoot: path.join(root, "public") });
}

function researchFrontmatter(slug: string, order: number) {
  return `---
title: "${slug}"
slug: "${slug}"
summary: "Summary"
order: ${order}
status: "Ongoing"
researchArea: "Systems"
tools:
  - "TypeScript"
affiliation: "Lab"
---
Body
`;
}

function projectFrontmatter(slug: string, order: number, summary: string, imageWidth = 1) {
  return `---
title: "${slug}"
slug: "${slug}"
summary: "${summary}"
order: ${order}
stack:
  - "TypeScript"
github: "https://github.com/example/${slug}"
image: "/projects/fixture.png"
imageAlt: "Fixture"
imageWidth: ${imageWidth}
imageHeight: 1
---
Body
`;
}

afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of temporaryDirectories.splice(0)) fs.rmSync(directory, { recursive: true, force: true });
});

describe("content repository", () => {
  it("loads and validates the real content corpus", () => {
    const repository = createContentRepository({
      contentRoot: path.join(process.cwd(), "content"),
      publicRoot: path.join(process.cwd(), "public"),
    });
    expect(repository.list("projects")).toHaveLength(4);
    expect(repository.list("research")).toHaveLength(3);
    expect(repository.get("projects", "combat-chess")).toBeNull();
  });

  it("does not construct filesystem paths from unknown route input", () => {
    const repository = makeRepository({ "known.md": researchFrontmatter("known", 1) });
    expect(repository.get("research", "../../etc/passwd")).toBeNull();
  });

  it("rejects a slug that differs from its filename", () => {
    const repository = makeRepository({ "filename.md": researchFrontmatter("different", 1) });
    expect(() => repository.list("research")).toThrow(/must match filename/);
  });

  it("rejects duplicate ordering", () => {
    const repository = makeRepository({
      "one.md": researchFrontmatter("one", 1),
      "two.md": researchFrontmatter("two", 1),
    });
    expect(() => repository.list("research")).toThrow(/Duplicate order/);
  });

  it("rejects duplicate project summaries", () => {
    const repository = makeRepository({
      "one.md": projectFrontmatter("one", 1, "Repeated summary"),
      "two.md": projectFrontmatter("two", 2, "Repeated summary"),
    }, "projects");
    expect(() => repository.list("projects")).toThrow(/Duplicate summary/);
  });

  it("reports actionable frontmatter validation details", () => {
    const repository = makeRepository({
      "invalid.md": `---
title: "Invalid"
slug: "invalid"
summary: "Summary"
order: 1
---
Body
`,
    });
    expect(() => repository.list("research")).toThrow(/Invalid front matter.*status/);
  });

  it("preserves unexpected parser failures", () => {
    vi.spyOn(contentSchemas.research, "parse").mockImplementationOnce(() => {
      throw new Error("parser failure");
    });
    const repository = makeRepository({ "known.md": researchFrontmatter("known", 1) });
    expect(() => repository.list("research")).toThrow("parser failure");
  });

  it("rejects project image dimension drift", () => {
    const repository = makeRepository({
      "project.md": projectFrontmatter("project", 1, "Unique summary", 2),
    }, "projects");
    expect(() => repository.list("projects")).toThrow(/are 1x1; expected 2x1/);
  });

  it("reloads content after the cache is cleared", () => {
    const repository = makeRepository({ "known.md": researchFrontmatter("known", 1) });
    const firstLoad = repository.list("research");
    repository.clearCache();
    const secondLoad = repository.list("research");
    expect(secondLoad).not.toBe(firstLoad);
    expect(secondLoad).toEqual(firstLoad);
  });
});
