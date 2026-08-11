import type { Metadata } from "next";
import { absoluteUrl } from "@/config/site";
import { contentRepository, type ContentKind } from "@/lib/content";

const routeSegment = {
  projects: "projects",
  research: "research",
} satisfies Record<ContentKind, string>;

export function createContentMetadata(kind: ContentKind, slug: string): Metadata {
  const entry = contentRepository.get(kind, slug);
  const singular = kind === "projects" ? "Project" : "Research";
  if (!entry) return { title: `${singular} not found` };

  const url = absoluteUrl(`/${routeSegment[kind]}/${slug}`);
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: entry.frontmatter.title,
      description: entry.frontmatter.summary,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.frontmatter.title,
      description: entry.frontmatter.summary,
    },
  };
}
