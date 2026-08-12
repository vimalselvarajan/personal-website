import { preload } from "react-dom";

type ResponsiveImagePreloadProps = {
  href: string;
  imageSrcSet: string;
  imageSizes: string;
  type: `image/${string}`;
};

export function ResponsiveImagePreload({
  href,
  imageSrcSet,
  imageSizes,
  type,
}: ResponsiveImagePreloadProps) {
  preload(href, {
    as: "image",
    fetchPriority: "high",
    imageSrcSet,
    imageSizes,
    type,
  });

  return null;
}
