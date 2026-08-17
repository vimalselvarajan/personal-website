import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { preload } from "react-dom";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { Container } from "@/components/container";
import { ExternalAnchor } from "@/components/external-link";
import { Button } from "@/components/ui/button";
import { assetUrl, siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/metadata";

const profileWidths = [384, 640, 768, 1024, 1280] as const;
const profileSizes = "(min-width: 1280px) 352px, (min-width: 1024px) 304px, calc(100vw - 2.5rem)";

function profileSourceSet(extension: "avif" | "webp" | "jpg") {
  return profileWidths
    .map((width) => `${assetUrl(`/assets/images/profile/profile-${width}.${extension}`)} ${width}w`)
    .join(", ");
}

function ProfilePicture() {
  const avifSourceSet = profileSourceSet("avif");
  const webpSourceSet = profileSourceSet("webp");
  const jpegSourceSet = profileSourceSet("jpg");

  preload(assetUrl("/assets/images/profile/profile-1280.avif"), {
    as: "image",
    type: "image/avif",
    fetchPriority: "high",
    imageSrcSet: avifSourceSet,
    imageSizes: profileSizes,
  });

  return (
    <picture>
      <source type="image/avif" srcSet={avifSourceSet} sizes={profileSizes} />
      <source type="image/webp" srcSet={webpSourceSet} sizes={profileSizes} />
      <img
        src={assetUrl("/assets/images/profile/profile-1280.jpg")}
        srcSet={jpegSourceSet}
        sizes={profileSizes}
        width={1280}
        height={960}
        alt={`Portrait of ${siteConfig.name}`}
        loading="eager"
        fetchPriority="high"
        decoding="async"
        className="absolute inset-0 size-full object-cover object-[62%_center]"
      />
    </picture>
  );
}


export const metadata: Metadata = createPageMetadata({
  path: "/",
  title: siteConfig.metadata.title,
  description: siteConfig.metadata.description,
});

export default function HomePage() {
  return (
    <div className="home-page archive-landing" data-landing-only>
      <section aria-labelledby="home-heading">
        <Container className="home-hero min-h-[calc(100svh-5rem)] py-12 sm:py-16 lg:grid lg:content-center lg:py-20">
          <div className="landing-grid">
            <div>
              <h1 id="home-heading" className="landing-title">{siteConfig.name}</h1>
              <p className="landing-copy">
                {siteConfig.introduction} Explore my{" "}
                <Link
                  href="/projects"
                  transitionTypes={["nav-root"]}
                  className="font-semibold text-link underline-offset-4 hover:underline"
                >
                  Projects
                </Link>{" "}
                and{" "}
                <Link
                  href="/research/optimal-read-selection"
                  transitionTypes={["nav-forward"]}
                  aria-label="Read the research overview"
                  className="font-semibold text-link underline-offset-4 hover:underline"
                >
                  Research
                </Link>.
              </p>
              <div className="landing-actions">
                <Button asChild size="icon" className="border-[#24292F] bg-[#24292F] text-white shadow-[0_14px_28px_-18px_#24292F] hover:bg-[#1F2328] hover:shadow-[0_18px_32px_-18px_#24292F]">
                  <ExternalAnchor href={siteConfig.links.github} aria-label="GitHub (opens in a new tab)" title="GitHub">
                    <GitHubIcon aria-hidden="true" className="size-5" />
                  </ExternalAnchor>
                </Button>
                <Button asChild size="icon" className="border-[#0A66C2] bg-[#0A66C2] text-white shadow-[0_14px_28px_-18px_#0A66C2] hover:bg-[#004182] hover:shadow-[0_18px_32px_-18px_#0A66C2]">
                  <ExternalAnchor href={siteConfig.links.linkedin} aria-label="LinkedIn (opens in a new tab)" title="LinkedIn">
                    <LinkedInIcon aria-hidden="true" className="size-5" />
                  </ExternalAnchor>
                </Button>
                <Button asChild variant="secondary" size="icon">
                  <Link href={siteConfig.links.resume} transitionTypes={["nav-root"]} aria-label="Résumé" title="Résumé">
                    <FileText aria-hidden="true" className="size-5" />
                  </Link>
                </Button>
              </div>
            </div>
            <aside className="landing-portrait" aria-label="Profile">
              <figure className="landing-portrait-media"><ProfilePicture /></figure>
            </aside>
          </div>
        </Container>
      </section>

    </div>
  );
}
