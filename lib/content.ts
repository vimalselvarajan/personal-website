import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type {
  CommonFrontmatter,
  ContentKind,
  ContentMetaMap,
  ProjectFrontmatter,
  ResearchFrontmatter,
} from "@/lib/content-types";

const contentRoot = path.join(process.cwd(), "content");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireRecord(value: unknown, file: string): Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`Invalid front matter object in ${file}`);
  return value;
}

function requiredString(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`Missing or invalid \"${key}\" in ${file}`);
  }
  return value;
}

function requiredBoolean(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (typeof value !== "boolean") throw new Error(`Missing or invalid \"${key}\" in ${file}`);
  return value;
}

function requiredNumber(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(`Missing or invalid \"${key}\" in ${file}`);
  }
  return value;
}

function requiredStrings(data: Record<string, unknown>, key: string, file: string) {
  const value = data[key];
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`Missing or invalid string list \"${key}\" in ${file}`);
  }
  return value;
}

function common(data: Record<string, unknown>, file: string): CommonFrontmatter {
  return {
    title: requiredString(data, "title", file),
    slug: requiredString(data, "slug", file),
    summary: requiredString(data, "summary", file),
    featured: requiredBoolean(data, "featured", file),
    order: requiredNumber(data, "order", file),
  };
}

function validateProject(data: Record<string, unknown>, file: string): ProjectFrontmatter {
  return {
    ...common(data, file),
    stack: requiredStrings(data, "stack", file),
    github: requiredString(data, "github", file),
    image: requiredString(data, "image", file),
    imageAlt: requiredString(data, "imageAlt", file),
    imageWidth: requiredNumber(data, "imageWidth", file),
    imageHeight: requiredNumber(data, "imageHeight", file),
  };
}

function validateResearch(data: Record<string, unknown>, file: string): ResearchFrontmatter {
  return {
    ...common(data, file),
    status: requiredString(data, "status", file),
    researchArea: requiredString(data, "researchArea", file),
    tools: requiredStrings(data, "tools", file),
    affiliation: requiredString(data, "affiliation", file),
  };
}

const validators = {
  projects: validateProject,
  research: validateResearch,
} satisfies {
  [K in ContentKind]: (data: Record<string, unknown>, file: string) => ContentMetaMap[K];
};

export type ContentEntry<K extends ContentKind> = {
  frontmatter: ContentMetaMap[K];
  source: string;
};

export function getContentSlugs(kind: ContentKind): string[] {
  return fs
    .readdirSync(path.join(contentRoot, kind))
    .filter((file) => file.endsWith(".mdx"))
    .map((file) => file.replace(/\.mdx$/, ""))
    .sort();
}

export function getContentEntry<K extends ContentKind>(kind: K, slug: string): ContentEntry<K> | null {
  const file = path.join(contentRoot, kind, `${slug}.mdx`);
  if (!fs.existsSync(file)) return null;
  const parsed = matter(fs.readFileSync(file, "utf8"));
  const data = requireRecord(parsed.data, file);
  const frontmatter = validators[kind](data, file);
  if (frontmatter.slug !== slug) {
    throw new Error(`Front matter slug \"${frontmatter.slug}\" must match filename \"${slug}\" in ${file}`);
  }
  return { frontmatter, source: parsed.content } as ContentEntry<K>;
}

export function getAllContent<K extends ContentKind>(kind: K): ContentEntry<K>[] {
  return getContentSlugs(kind)
    .map((slug) => {
      const entry = getContentEntry(kind, slug);
      if (!entry) throw new Error(`Content disappeared while loading ${kind}/${slug}`);
      return entry;
    })
    .sort((a, b) => a.frontmatter.order - b.frontmatter.order);
}
