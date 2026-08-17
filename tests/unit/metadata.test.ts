import { describe, expect, it } from "vitest";
import { createPageMetadata } from "@/lib/metadata";

const expectedSocialImage = {
  url: "https://vimalselvarajan.github.io/personal-website/social-preview.png",
  width: 1200,
  height: 630,
  alt: "Vimal Selvarajan portfolio preview",
  type: "image/png",
};

describe("page metadata", () => {
  it("builds complete canonical, Open Graph, and Twitter metadata", () => {
    const metadata = createPageMetadata({
      path: "/about",
      title: "About",
      description: "About page",
    });

    expect(metadata).toMatchObject({
      title: "About",
      description: "About page",
      alternates: {
        canonical: "https://vimalselvarajan.github.io/personal-website/about/",
      },
      openGraph: {
        type: "website",
        url: "https://vimalselvarajan.github.io/personal-website/about/",
        title: "About",
        description: "About page",
        images: [expectedSocialImage],
      },
      twitter: {
        card: "summary_large_image",
        title: "About",
        description: "About page",
        images: [expectedSocialImage],
      },
    });
  });

  it("uses an absolute title for the homepage", () => {
    expect(createPageMetadata({ path: "/", title: "Portfolio", description: "Home" }).title).toEqual({ absolute: "Portfolio" });
  });
});
