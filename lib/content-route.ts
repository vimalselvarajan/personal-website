import type { Metadata } from "next";
import { contentRepository, type ContentKind } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";
import { contentRoute } from "@/lib/routes";

export function createContentMetadata(kind: ContentKind, slug: string): Metadata {
  const entry = contentRepository.get(kind, slug);
  const singular = kind === "projects" ? "Project" : "Research";
  if (!entry) return { title: `${singular} not found` };

  return createPageMetadata({
    path: contentRoute(kind, slug),
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary,
    type: "article",
  });
}