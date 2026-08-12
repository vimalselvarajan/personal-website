import Image from "next/image";
import { ResponsiveImagePreload } from "@/components/responsive-image-preload";
import { assetUrl } from "@/config/site";
import type { ProjectFrontmatter } from "@/lib/content";
import {
  getProjectCardImageSizes,
  getProjectCardImageVariantPath,
  getProjectCardImageVariantWidths,
} from "@/lib/project-image-variants";
import type { ProjectCardImageFormat } from "@/lib/project-image-variants";

type ProjectCardImageProps = {
  project: ProjectFrontmatter;
  preload?: boolean;
};

export function ProjectCardImage({ project, preload = false }: ProjectCardImageProps) {
  const cardImage = project.cardImage ?? {
    src: project.image,
    width: project.imageWidth,
    height: project.imageHeight,
  };
  const sizes = getProjectCardImageSizes();
  const widths = getProjectCardImageVariantWidths(cardImage.width);
  const buildSrcSet = (format: ProjectCardImageFormat) => widths
    .map((width) => (
      `${assetUrl(getProjectCardImageVariantPath(project.slug, width, format))} ${width}w`
    ))
    .join(", ");
  const avifSrcSet = buildSrcSet("avif");
  const webpSrcSet = buildSrcSet("webp");
  const preloadWidth = widths.find((width) => width >= 672) ?? cardImage.width;
  const preloadHref = assetUrl(
    getProjectCardImageVariantPath(project.slug, preloadWidth, "avif"),
  );

  return (
    <>
      {preload ? (
        <ResponsiveImagePreload
          href={preloadHref}
          imageSrcSet={avifSrcSet}
          imageSizes={sizes}
          type="image/avif"
        />
      ) : null}
      <picture>
        <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
        <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
        <Image
          src={assetUrl(cardImage.src)}
          alt={project.imageAlt}
          fill
          sizes={sizes}
          loading={preload ? "eager" : "lazy"}
          fetchPriority={preload ? "high" : "auto"}
          decoding={preload ? "sync" : "async"}
          className="object-cover"
          data-project-card-image={project.slug}
        />
      </picture>
    </>
  );
}
