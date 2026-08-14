import { z } from "zod";

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "must be a lowercase kebab-case slug");
const nonEmptyString = z.string().trim().min(1);
const nonEmptyStrings = z.array(nonEmptyString).min(1);
const positiveInteger = z.number().int().positive();
const httpsUrl = z.string().url().refine((value) => new URL(value).protocol === "https:", "must use HTTPS");
const githubUrl = httpsUrl.refine((value) => new URL(value).hostname === "github.com", "must use github.com");
const projectImage = z.string().regex(/^\/projects\/[a-zA-Z0-9._-]+\.(?:jpe?g|png|webp)$/i, "must reference a project image");
const projectImageAsset = z.object({
  src: projectImage,
  width: positiveInteger,
  height: positiveInteger,
}).strict();

const projectGalleryImage = projectImageAsset.extend({
  alt: nonEmptyString,
  caption: nonEmptyString,
}).strict();
const commonFrontmatterSchema = z.object({
  title: nonEmptyString,
  slug,
  summary: nonEmptyString,
  order: positiveInteger,
});

export const projectFrontmatterSchema = commonFrontmatterSchema.extend({
  stack: nonEmptyStrings,
  github: githubUrl,
  image: projectImage,
  imageAlt: nonEmptyString,
  imageCaption: nonEmptyString.optional(),
  imageWidth: positiveInteger,
  imageHeight: positiveInteger,
  cardImage: projectImageAsset.optional(),
  gallery: z.array(projectGalleryImage).min(1).optional(),
}).strict();

export const researchFrontmatterSchema = commonFrontmatterSchema.extend({
  status: nonEmptyString,
  researchArea: nonEmptyString,
  tools: nonEmptyStrings,
  affiliation: nonEmptyString,
}).strict();

export const contentKinds = ["projects", "research"] as const;
export type ContentKind = (typeof contentKinds)[number];
export type ProjectFrontmatter = z.infer<typeof projectFrontmatterSchema>;
export type ResearchFrontmatter = z.infer<typeof researchFrontmatterSchema>;
export type ContentMetaMap = {
  projects: ProjectFrontmatter;
  research: ResearchFrontmatter;
};

export const contentSchemas = {
  projects: projectFrontmatterSchema,
  research: researchFrontmatterSchema,
} satisfies { [K in ContentKind]: z.ZodType<ContentMetaMap[K]> };
