import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { getContentSlugs } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["", "/projects", "/research", "/about", "/resume"];
  const dynamicPaths = [
    ...getContentSlugs("projects").map((slug) => `/projects/${slug}`),
    ...getContentSlugs("research").map((slug) => `/research/${slug}`),
  ];

  return [...staticPaths, ...dynamicPaths].map((route) => ({
    url: absoluteUrl(route),
    changeFrequency: route === "" ? "monthly" : "yearly",
    priority: route === "" ? 1 : 0.7,
  }));
}
