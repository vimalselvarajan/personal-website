import Image from "next/image";
import { assetUrl } from "@/config/site";
import type { ResearchFrontmatter } from "@/lib/content-schema";
import {
  getResearchImageVariantPath,
  getResearchImageVariantWidths,
} from "@/lib/research-image-variants";

type ResearchImageProps = {
  research: ResearchFrontmatter;
  sizes: string;
  className?: string;
};

export function ResearchImage({
  research,
  sizes,
  className,
}: ResearchImageProps) {
  const {
    image,
    imageAlt,
    imageWidth,
    imageHeight,
  } = research;

  if (!image || !imageAlt || !imageWidth || !imageHeight) return null;

  const webpWidths = getResearchImageVariantWidths(imageWidth);
  const mobileWebpWidth = webpWidths[0];
  if (mobileWebpWidth === undefined) return null;

  const webpSrcSet = webpWidths
    .map((width) => (
      assetUrl(getResearchImageVariantPath(research.slug, width)) + " " + width + "w"
    ))
    .join(", ");
  const mobileWebpSrc = assetUrl(
    getResearchImageVariantPath(research.slug, mobileWebpWidth),
  );

  return (
    <picture>
      <source media="(max-width: 479px)" type="image/webp" srcSet={mobileWebpSrc} />
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <Image
        src={assetUrl(image)}
        width={imageWidth}
        height={imageHeight}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </picture>
  );
}
