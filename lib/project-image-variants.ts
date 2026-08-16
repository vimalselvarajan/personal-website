const projectDetailImageCandidateWidths = [384, 640, 960] as const;
const projectCardImageCandidateWidths = [384, 672, 960] as const;
const projectCardImageMaximumWidth = 1280;

export type ProjectCardImageFormat = "avif" | "webp";

const projectImageMaximumCssHeight = 42 * 16;
const projectImageMaximumContainerWidth = 1184;
const projectImageTabletBreakpoint = 640;
const projectImagePhoneBreakpoint = 480;
const projectImageMobileChrome = 56;
const projectImageDesktopChrome = 96;

const projectCardImageSizes = [
  "(min-width: 1280px) 592px",
  "(min-width: 1024px) calc(50vw - 3rem)",
  "(min-width: 640px) calc(100vw - 4rem)",
  "calc(100vw - 2.5rem)",
].join(", ");

function assertPositiveInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${label} must be a positive integer; received ${value}`);
  }
}

function getVariantWidths(
  sourceWidth: number,
  candidateWidths: readonly number[],
  maximumWidth = sourceWidth,
) {
  assertPositiveInteger(sourceWidth, "Project image width");
  const largestWidth = Math.min(sourceWidth, maximumWidth);

  return [
    ...candidateWidths.filter((width) => width < largestWidth),
    largestWidth,
  ];
}

export function getProjectImageVariantWidths(sourceWidth: number) {
  return getVariantWidths(sourceWidth, projectDetailImageCandidateWidths);
}

export function getProjectCardImageVariantWidths(sourceWidth: number) {
  return getVariantWidths(
    sourceWidth,
    projectCardImageCandidateWidths,
    projectCardImageMaximumWidth,
  );
}

export function getProjectImageVariantPath(slug: string, width: number) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Project image slug must be lowercase kebab-case; received "${slug}"`);
  }
  assertPositiveInteger(width, "Project image variant width");
  return `/projects/responsive/${slug}-${width}.webp` as const;
}

export function getProjectGalleryImageVariantPath(slug: string, index: number, width: number) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Project image slug must be lowercase kebab-case; received "${slug}"`);
  }
  if (!Number.isInteger(index) || index < 0) {
    throw new Error(`Project gallery image index must be a non-negative integer; received ${index}`);
  }
  assertPositiveInteger(width, "Project image variant width");
  return `/projects/responsive/${slug}-gallery-${index}-${width}.webp` as const;
}
export function getProjectCardImageVariantPath(
  slug: string,
  width: number,
  format: ProjectCardImageFormat,
) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error(`Project image slug must be lowercase kebab-case; received "${slug}"`);
  }
  assertPositiveInteger(width, "Project card image variant width");
  if (format !== "avif" && format !== "webp") {
    throw new Error(`Project card image format must be avif or webp; received "${format}"`);
  }
  return `/projects/responsive/${slug}-card-${width}.${format}` as const;
}

export function getProjectCardImageSizes() {
  return projectCardImageSizes;
}

export function getProjectImageSizes(sourceWidth: number, sourceHeight: number) {
  assertPositiveInteger(sourceWidth, "Project image width");
  assertPositiveInteger(sourceHeight, "Project image height");

  const heightConstrainedWidth = Math.ceil(
    projectImageMaximumCssHeight * (sourceWidth / sourceHeight),
  );
  const maximumRenderedWidth = Math.min(
    sourceWidth,
    heightConstrainedWidth,
    projectImageMaximumContainerWidth,
  );
  const fixedWidthBreakpoint = Math.min(
    projectImageMaximumContainerWidth + projectImageDesktopChrome,
    maximumRenderedWidth + projectImageDesktopChrome,
  );

  return [
    `(min-width: ${fixedWidthBreakpoint}px) ${maximumRenderedWidth}px`,
    `(min-width: ${projectImageTabletBreakpoint}px) calc(100vw - ${projectImageDesktopChrome / 16}rem)`,
    `(min-width: ${projectImagePhoneBreakpoint}px) calc(100vw - ${projectImageMobileChrome / 16}rem)`,
    "12rem",
  ].join(", ");
}
