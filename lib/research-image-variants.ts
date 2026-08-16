const researchImageCandidateWidths = [384, 640, 960, 1280] as const;

function assertPositiveInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(label + " must be a positive integer; received " + value);
  }
}

export function getResearchImageVariantWidths(sourceWidth: number) {
  assertPositiveInteger(sourceWidth, "Research image width");
  return [
    ...researchImageCandidateWidths.filter((width) => width < sourceWidth),
    sourceWidth,
  ];
}

export function getResearchImageVariantPath(slug: string, width: number) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error('Research image slug must be lowercase kebab-case; received "' + slug + '"');
  }
  assertPositiveInteger(width, "Research image variant width");
  return "/research/responsive/" + slug + "-" + width + ".webp";
}
