import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { contentRepository } from "@/lib/content";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/projects", "/research", "/about", "/resume"];
  const dynamicPaths = [
    ...contentRepository.staticParams("projects").map(({ slug }) => `/projects/${slug}`),
    ...contentRepository.staticParams("research").map(({ slug }) => `/research/${slug}`),
  ];

  return [...staticPaths, ...dynamicPaths].map((route) => ({
    url: absoluteUrl(route),
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1 : 0.7,
  }));
}
