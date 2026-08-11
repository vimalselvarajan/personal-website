export type CommonFrontmatter = {
  title: string;
  slug: string;
  summary: string;
  featured: boolean;
  order: number;
};

export type ProjectFrontmatter = CommonFrontmatter & {
  stack: string[];
  github: string;
  image: string;
  imageAlt: string;
  imageWidth: number;
  imageHeight: number;
};

export type ResearchFrontmatter = CommonFrontmatter & {
  status: string;
  researchArea: string;
  tools: string[];
  affiliation: string;
};

export type ContentKind = "projects" | "research";

export type ContentMetaMap = {
  projects: ProjectFrontmatter;
  research: ResearchFrontmatter;
};
