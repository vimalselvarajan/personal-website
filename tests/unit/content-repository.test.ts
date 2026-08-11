import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createContentRepository } from "@/lib/content-repository";

const temporaryDirectories: string[] = [];

function makeRepository(files: Record<string, string>) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-content-test-"));
  temporaryDirectories.push(root);
  const researchRoot = path.join(root, "content", "research");
  fs.mkdirSync(researchRoot, { recursive: true });
  for (const [filename, source] of Object.entries(files)) fs.writeFileSync(path.join(researchRoot, filename), source);
  return createContentRepository({ contentRoot: path.join(root, "content"), publicRoot: path.join(root, "public") });
}

function researchFrontmatter(slug: string, order: number, featured: boolean) {
  return `---
title: "${slug}"
slug: "${slug}"
summary: "Summary"
featured: ${featured}
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

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) fs.rmSync(directory, { recursive: true, force: true });
});

describe("content repository", () => {
  it("loads and validates the real content corpus", () => {
    const repository = createContentRepository({
      contentRoot: path.join(process.cwd(), "content"),
      publicRoot: path.join(process.cwd(), "public"),
    });
    expect(repository.list("projects")).toHaveLength(5);
    expect(repository.list("research")).toHaveLength(3);
    expect(repository.getFeatured("projects").frontmatter.slug).toBe("12v-to-3v3-buck-converter");
  });

  it("does not construct filesystem paths from unknown route input", () => {
    const repository = makeRepository({ "known.mdx": researchFrontmatter("known", 1, true) });
    expect(repository.get("research", "../../etc/passwd")).toBeNull();
  });

  it("rejects a slug that differs from its filename", () => {
    const repository = makeRepository({ "filename.mdx": researchFrontmatter("different", 1, true) });
    expect(() => repository.list("research")).toThrow(/must match filename/);
  });

  it("rejects duplicate ordering", () => {
    const repository = makeRepository({
      "one.mdx": researchFrontmatter("one", 1, true),
      "two.mdx": researchFrontmatter("two", 1, false),
    });
    expect(() => repository.list("research")).toThrow(/Duplicate order/);
  });

  it("requires exactly one featured entry", () => {
    const repository = makeRepository({
      "one.mdx": researchFrontmatter("one", 1, true),
      "two.mdx": researchFrontmatter("two", 2, true),
    });
    expect(() => repository.list("research")).toThrow(/exactly one featured/);
  });
});
