import type { Metadata } from "next";
import { absoluteUrl, canonicalUrl, siteConfig } from "@/config/site";
import type { PortfolioRoute } from "@/lib/routes";

export const socialImage = {
  url: absoluteUrl("/social-preview.png"),
  width: 1200,
  height: 630,
  alt: `${siteConfig.name} portfolio preview`,
  type: "image/png",
} as const;

type PageMetadataInput = {
  path: PortfolioRoute;
  title: string;
  description: string;
  type?: "website" | "article";
};

export function createPageMetadata({
  path,
  title,
  description,
  type = "website",
}: PageMetadataInput): Metadata {
  const canonical = canonicalUrl(path);

  return {
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical },
    openGraph: {
      type,
      url: canonical,
      title,
      description,
      siteName: siteConfig.name,
      locale: "en_US",
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [socialImage],
    },
  };
}
