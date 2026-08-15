import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ZodError } from "zod";
import { contentSchemas, type ContentKind, type ContentMetaMap } from "@/lib/content-schema";
import { readImageDimensions } from "@/lib/image-dimensions";

export type ContentEntry<K extends ContentKind> = {
  frontmatter: ContentMetaMap[K];
  source: string;
};

type RepositoryOptions = {
  contentRoot: string;
  publicRoot: string;
  cache?: boolean;
};

function describeError(error: unknown, file: string) {
  if (!(error instanceof ZodError)) return error;
  const details = error.issues.map((issue) => `${issue.path.join(".") || "frontmatter"}: ${issue.message}`).join("; ");
  return new Error(`Invalid front matter in ${file}: ${details}`);
}

function assertUnique<K extends ContentKind>(
  entries: readonly ContentEntry<K>[],
  field: "slug" | "order" | "summary",
  kind: K,
) {
  const seen = new Set<string | number>();
  for (const entry of entries) {
    const value = entry.frontmatter[field];
    if (seen.has(value)) throw new Error(`Duplicate ${field} "${value}" in ${kind}`);
    seen.add(value);
  }
}

function assertImageAsset(
  asset: { src: string; width: number; height: number },
  file: string,
  publicRoot: string,
  kind: "project" | "research",
) {
  const imageFile = path.join(publicRoot, asset.src.slice(1));
  if (!fs.existsSync(imageFile)) throw new Error(`Missing ${kind} image ${asset.src} referenced by ${file}`);
  const dimensions = readImageDimensions(fs.readFileSync(imageFile), imageFile);
  if (dimensions.width !== asset.width || dimensions.height !== asset.height) {
    throw new Error(
      `Image dimensions for ${asset.src} are ${dimensions.width}x${dimensions.height}; expected ${asset.width}x${asset.height}`,
    );
  }
}

export function createContentRepository({
  contentRoot,
  publicRoot,
  cache: cacheEnabled = true,
}: RepositoryOptions) {
  const cache = new Map<ContentKind, readonly ContentEntry<ContentKind>[]>();

  function load<K extends ContentKind>(kind: K): readonly ContentEntry<K>[] {
    if (cacheEnabled) {
      const cached = cache.get(kind);
      if (cached) return cached as readonly ContentEntry<K>[];
    }

    const directory = path.join(contentRoot, kind);
    const entries = fs.readdirSync(directory)
      .filter((file) => file.endsWith(".md"))
      .sort()
      .map((filename) => {
        const file = path.join(directory, filename);
        const parsed = matter(fs.readFileSync(file, "utf8"));
        let frontmatter: ContentMetaMap[K];
        try {
          frontmatter = contentSchemas[kind].parse(parsed.data) as ContentMetaMap[K];
        } catch (error) {
          throw describeError(error, file);
        }

        const filenameSlug = filename.replace(/\.md$/, "");
        if (frontmatter.slug !== filenameSlug) {
          throw new Error(`Front matter slug "${frontmatter.slug}" must match filename "${filenameSlug}" in ${file}`);
        }

        if (kind === "projects") {
          const project = frontmatter as ContentMetaMap["projects"];
          const assets = [
            { src: project.image, width: project.imageWidth, height: project.imageHeight },
            ...(project.cardImage ? [project.cardImage] : []),
          ];
          for (const asset of assets) assertImageAsset(asset, file, publicRoot, "project");
        }

        if (kind === "research") {
          const research = frontmatter as ContentMetaMap["research"];
          if (research.image && research.imageWidth && research.imageHeight) {
            assertImageAsset(
              { src: research.image, width: research.imageWidth, height: research.imageHeight },
              file,
              publicRoot,
              "research",
            );
          }
        }

        return { frontmatter, source: parsed.content } as ContentEntry<K>;
      })
      .sort((a, b) => a.frontmatter.order - b.frontmatter.order);

    assertUnique(entries, "slug", kind);
    assertUnique(entries, "order", kind);
    if (kind === "projects") assertUnique(entries, "summary", kind);

    if (cacheEnabled) {
      cache.set(kind, entries as readonly ContentEntry<ContentKind>[]);
    }
    return entries;
  }

  return {
    list<K extends ContentKind>(kind: K): readonly ContentEntry<K>[] {
      return load(kind);
    },
    get<K extends ContentKind>(kind: K, slug: string): ContentEntry<K> | null {
      return load(kind).find((entry) => entry.frontmatter.slug === slug) ?? null;
    },
    staticParams(kind: ContentKind): Array<{ slug: string }> {
      return load(kind).map((entry) => ({ slug: entry.frontmatter.slug }));
    },
    clearCache() {
      cache.clear();
    },
  };
}