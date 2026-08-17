import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { createContentRepository } from "@/lib/content-repository";
import { contentSchemas } from "@/lib/content-schema";

const temporaryDirectories: string[] = [];

function makeRepository(files: Record<string, string>, cache = true) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-content-test-"));
  temporaryDirectories.push(root);
  const contentDirectory = path.join(root, "content", "research");
  fs.mkdirSync(contentDirectory, { recursive: true });
  for (const [filename, source] of Object.entries(files)) fs.writeFileSync(path.join(contentDirectory, filename), source);
  const imageRoot = path.join(root, "public", "assets", "images", "research", "originals");
  fs.mkdirSync(imageRoot, { recursive: true });
  fs.writeFileSync(path.join(imageRoot, "fixture.png"), Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Z9S8AAAAASUVORK5CYII=", "base64"));
  return {
    contentDirectory,
    repository: createContentRepository({
      contentRoot: path.join(root, "content"),
      publicRoot: path.join(root, "public"),
      cache,
    }),
  };
}

function researchFrontmatter(slug: string, order: number, imageWidth?: number, body = "Body") {
  const image = imageWidth ? ['image: "/assets/images/research/originals/fixture.png"', 'imageAlt: "Fixture"', 'imageWidth: ' + imageWidth, 'imageHeight: 1'] : [];
  return ['---', 'title: "' + slug + '"', 'slug: "' + slug + '"', 'summary: "Summary"', 'order: ' + order, 'status: "Ongoing"', 'researchArea: "Systems"', 'tools:', '  - "TypeScript"', 'affiliation: "Lab"', ...image, '---', body, ''].join('\n');
}
afterEach(() => {
  vi.restoreAllMocks();
  for (const directory of temporaryDirectories.splice(0)) fs.rmSync(directory, { recursive: true, force: true });
});

describe("content repository", () => {
  it("loads and validates the real research corpus", () => {
    const repository = createContentRepository({ contentRoot: path.join(process.cwd(), "content"), publicRoot: path.join(process.cwd(), "public") });
    expect(repository.list("research")).toHaveLength(3);
    expect(repository.get("research", "missing")).toBeNull();
  });

  it("does not construct filesystem paths from unknown route input", () => {
    const { repository } = makeRepository({ "known.md": researchFrontmatter("known", 1) });
    expect(repository.get("research", "../../etc/passwd")).toBeNull();
  });

  it("rejects a slug that differs from its filename", () => {
    const { repository } = makeRepository({ "filename.md": researchFrontmatter("different", 1) });
    expect(() => repository.list("research")).toThrow(/must match filename/);
  });

  it("rejects duplicate ordering", () => {
    const { repository } = makeRepository({ "one.md": researchFrontmatter("one", 1), "two.md": researchFrontmatter("two", 1) });
    expect(() => repository.list("research")).toThrow(/Duplicate order/);
  });

  it("reports actionable frontmatter validation details", () => {
    const { repository } = makeRepository({ "invalid.md": ["---", "title: \"Invalid\"", "slug: \"invalid\"", "summary: \"Summary\"", "order: 1", "---", "Body"].join("\n") });
    expect(() => repository.list("research")).toThrow(/Invalid front matter.*status/);
  });

  it("preserves unexpected parser failures", () => {
    vi.spyOn(contentSchemas.research, "parse").mockImplementationOnce(() => { throw new Error("parser failure"); });
    const { repository } = makeRepository({ "known.md": researchFrontmatter("known", 1) });
    expect(() => repository.list("research")).toThrow("parser failure");
  });

  it("rejects research image dimension drift", () => {
    const { repository } = makeRepository({ "research.md": researchFrontmatter("research", 1, 2) });
    expect(() => repository.list("research")).toThrow(/are 1x1; expected 2x1/);
  });

  it("memoizes by default and reloads content after the cache is cleared", () => {
    const { contentDirectory, repository } = makeRepository({ "known.md": researchFrontmatter("known", 1) });
    const firstLoad = repository.list("research");
    fs.writeFileSync(path.join(contentDirectory, "new.md"), researchFrontmatter("new", 2));

    expect(repository.list("research")).toBe(firstLoad);
    expect(firstLoad).toHaveLength(1);

    repository.clearCache();
    const refreshed = repository.list("research");
    expect(refreshed).not.toBe(firstLoad);
    expect(refreshed.map((entry) => entry.frontmatter.slug)).toEqual(["known", "new"]);
  });

  it("reloads added and edited content automatically when caching is disabled", () => {
    const { contentDirectory, repository } = makeRepository(
      { "known.md": researchFrontmatter("known", 1) },
      false,
    );
    const firstLoad = repository.list("research");
    fs.writeFileSync(path.join(contentDirectory, "known.md"), researchFrontmatter("known", 1, undefined, "Updated body"));
    fs.writeFileSync(path.join(contentDirectory, "new.md"), researchFrontmatter("new", 2));

    const refreshed = repository.list("research");
    expect(refreshed).not.toBe(firstLoad);
    expect(refreshed.map((entry) => entry.frontmatter.slug)).toEqual(["known", "new"]);
    expect(refreshed[0]?.source.trim()).toBe("Updated body");
  });
});
