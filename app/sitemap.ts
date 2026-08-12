import type { MetadataRoute } from "next";
import { canonicalUrl } from "@/config/site";
import { getSiteRoutes } from "@/lib/site-routes";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return getSiteRoutes().map((route) => ({
    url: canonicalUrl(route),
    changeFrequency: route === "/" ? "monthly" : "yearly",
    priority: route === "/" ? 1 : 0.7,
  }));
}
