import Image from "next/image";
import { assetUrl } from "@/config/site";
import type { ProjectFrontmatter } from "@/lib/content";
import {
  getProjectImageSizes,
  getProjectImageVariantPath,
  getProjectImageVariantWidths,
} from "@/lib/project-image-variants";

type ProjectDetailImageProps = Pick<
  ProjectFrontmatter,
  "slug" | "image" | "imageAlt" | "imageWidth" | "imageHeight"
>;

export function ProjectDetailImage({
  slug,
  image,
  imageAlt,
  imageWidth,
  imageHeight,
}: ProjectDetailImageProps) {
  const sizes = getProjectImageSizes(imageWidth, imageHeight);
  const webpSrcSet = getProjectImageVariantWidths(imageWidth)
    .map((width) => `${assetUrl(getProjectImageVariantPath(slug, width))} ${width}w`)
    .join(", ");

  return (
    <picture>
      <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
      <Image
        src={assetUrl(image)}
        width={imageWidth}
        height={imageHeight}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
        className="mx-auto max-h-[42rem] h-auto w-auto max-w-full rounded-2xl object-contain"
      />
    </picture>
  );
}
