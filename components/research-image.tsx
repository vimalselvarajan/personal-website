import Image from "next/image";
import { assetUrl } from "@/config/site";
import type { ResearchFrontmatter } from "@/lib/content-schema";

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

  return (
    <Image
      src={assetUrl(image)}
      width={imageWidth}
      height={imageHeight}
      alt={imageAlt}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      className={className}
    />
  );
}
