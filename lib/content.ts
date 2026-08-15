import "server-only";
import path from "node:path";
import { createContentRepository } from "@/lib/content-repository";

export type { ContentEntry } from "@/lib/content-repository";
export type { ContentKind, ProjectFrontmatter, ResearchFrontmatter } from "@/lib/content-schema";

export const contentRepository = createContentRepository({
  contentRoot: path.join(process.cwd(), "content"),
  publicRoot: path.join(process.cwd(), "public"),
  cache: process.env.NODE_ENV !== "development",
});