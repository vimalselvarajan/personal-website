import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap, Mail } from "lucide-react";
import { preload } from "react-dom";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { Container } from "@/components/container";
import { ExternalAnchor } from "@/components/external-link";
import { ProjectCardImage } from "@/components/project-card-image";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { assetUrl, siteConfig } from "@/config/site";
import { contentRepository } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

const profileWidths = [384, 640, 768, 1024, 1280] as const;
const profileSizes = "(min-width: 1280px) 352px, (min-width: 1024px) 304px, calc(100vw - 2.5rem)";

function profileSourceSet(extension: "avif" | "webp" | "jpg") {
  return profileWidths
    .map((width) => `${assetUrl(`/profile/profile-${width}.${extension}`)} ${width}w`)
    .join(", ");
}

function ProfilePicture() {
  const avifSourceSet = profileSourceSet("avif");
  const webpSourceSet = profileSourceSet("webp");
  const jpegSourceSet = profileSourceSet("jpg");

  preload(assetUrl("/profile/profile-1280.avif"), {
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
        src={assetUrl("/profile/profile-1280.jpg")}
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

function requireProject(slug: string) {
  const project = contentRepository.get("projects", slug);
  if (!project) throw new Error(`Missing curated project: ${slug}`);
  return project;
}

function requireResearch(slug: string) {
  const research = contentRepository.get("research", slug);
  if (!research) throw new Error(`Missing curated research entry: ${slug}`);
  return research;
}

export const metadata: Metadata = createPageMetadata({
  path: "/",
  title: siteConfig.metadata.title,
  description: siteConfig.metadata.description,
});

export default function HomePage() {
  const hastest = requireProject("hastest-control-suite");
  const mtpLite = requireResearch("optimal-read-selection");
  const additionalProjects = [
    requireProject("12v-to-3v3-buck-converter"),
    requireProject("driver-interfaces"),
    requireProject("mini-genome-assembler"),
  ];
  const currentResearch = [
    requireResearch("adaptive-cache-warming"),
    requireResearch("secure-processing-in-memory"),
  ];

  return (
      <div className="home-page archive-landing">
      <section aria-labelledby="home-heading">
        <Container className="home-hero min-h-[calc(100svh-5rem)] py-12 sm:py-16 lg:grid lg:content-center lg:py-20">
          <div className="landing-grid">
            <div>
              <div className="landing-status">
                <GraduationCap aria-hidden="true" className="size-4" />
                {siteConfig.university}
              </div>
              <p className="eyebrow mt-8">{siteConfig.role}</p>
              <h1 id="home-heading" className="landing-title">{siteConfig.name}</h1>
              <p className="landing-copy">{siteConfig.introduction}</p>
              <div className="landing-actions">
                <Button asChild>
                  <a href="#selected-work">
                    View selected work <ArrowRight aria-hidden="true" className="size-4" />
                  </a>
                </Button>
                <Button asChild variant="secondary">
                  <Link href={siteConfig.links.resume} transitionTypes={["nav-root"]}>Résumé</Link>
                </Button>
                <Button asChild variant="ghost">
                  <a href={siteConfig.links.email}>
                    Email <Mail aria-hidden="true" className="size-4" />
                  </a>
                </Button>
              </div>
            </div>
            <aside className="landing-portrait" aria-label="Profile">
              <figure className="landing-portrait-media"><ProfilePicture /></figure>
            </aside>
          </div>
        </Container>
      </section>

      <section id="selected-work" aria-labelledby="selected-work-heading" className="home-selected-work border-y border-border bg-surface/55 py-16 sm:py-24">
        <Container>
          <header className="home-section-heading max-w-3xl">
            <p className="eyebrow">Selected work</p>
            <h2 id="selected-work-heading" className="mt-4 text-balance text-[clamp(2.65rem,6vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
              Engineering with evidence behind it.
            </h2>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
              Two examples of how I turn research questions and hardware requirements into tested systems.
            </p>
          </header>

          <div className="home-feature-grid mt-12 grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-start">
            <article data-scene={hastest.frontmatter.slug} className="home-feature-card overflow-hidden rounded-[2rem] border border-border bg-background shadow-[var(--surface-shadow)]">
              <div className="home-feature-media relative aspect-[4/3] overflow-hidden bg-muted">
                <ProjectCardImage project={hastest.frontmatter} />
              </div>
              <div className="home-feature-copy p-6 sm:p-8">
                <Badge>Engineering platform</Badge>
                <h3 className="mt-5 text-balance text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">
                  {hastest.frontmatter.title}
                </h3>
                <p className="mt-4 leading-7 text-muted-foreground">{hastest.frontmatter.summary}</p>
                <dl className="home-metrics mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="home-metric rounded-2xl border border-border bg-surface p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Validation run</dt>
                    <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">1,000 hours</dd>
                  </div>
                  <div className="home-metric rounded-2xl border border-border bg-surface p-4">
                    <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Test capacity</dt>
                    <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">48 RF modules</dd>
                  </div>
                </dl>
                <Link href={`/projects/${hastest.frontmatter.slug}`} transitionTypes={["nav-forward"]} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link underline-offset-4 hover:underline">
                  Explore the platform <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </div>
            </article>

            <article className="home-feature-card home-feature-card-research rounded-[2rem] border border-border bg-background p-6 shadow-[var(--surface-shadow)] sm:p-8">
              <div className="flex flex-wrap gap-2">
                <Badge>{mtpLite.frontmatter.status}</Badge>
                <Badge>{mtpLite.frontmatter.researchArea}</Badge>
              </div>
              <p className="eyebrow mt-8">Lead research result</p>
              <h3 className="mt-4 text-balance text-3xl font-semibold leading-tight tracking-[-0.045em] sm:text-4xl">
                {mtpLite.frontmatter.title}
              </h3>
              <p className="mt-4 leading-7 text-muted-foreground">{mtpLite.frontmatter.summary}</p>
              <dl className="home-metrics mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div className="home-metric rounded-2xl border border-border bg-surface p-4 sm:col-span-2 lg:col-span-1 xl:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Assembly fragmentation</dt>
                  <dd className="mt-2 text-4xl font-semibold tracking-[-0.055em] text-link">91% lower</dd>
                </div>
                <div className="home-metric rounded-2xl border border-border bg-surface p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Genome fraction</dt>
                  <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">99.9%</dd>
                </div>
                <div className="home-metric rounded-2xl border border-border bg-surface p-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Sequence identity</dt>
                  <dd className="mt-2 text-2xl font-semibold tracking-[-0.04em]">99.9%</dd>
                </div>
              </dl>
              <Link href={`/research/${mtpLite.frontmatter.slug}`} transitionTypes={["nav-forward"]} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link underline-offset-4 hover:underline">
                Read the research overview <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </article>
          </div>
        </Container>
      </section>

      <section aria-labelledby="explore-heading" className="home-link-groups py-16 sm:py-24">
        <Container>
          <header className="max-w-2xl">
            <p className="eyebrow">Explore</p>
            <h2 id="explore-heading" className="mt-4 text-balance text-[clamp(2.25rem,5vw,4.25rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
              More across the stack.
            </h2>
          </header>
          <div className="mt-10 grid gap-8 lg:grid-cols-3">
            <section aria-labelledby="additional-projects-heading" className="home-link-group border-t border-border pt-5">
              <h3 id="additional-projects-heading" className="font-semibold tracking-[-0.02em]">Additional projects</h3>
              <ul className="mt-3 divide-y divide-border">
                {additionalProjects.map((project) => (
                  <li key={project.frontmatter.slug}>
                    <Link href={`/projects/${project.frontmatter.slug}`} transitionTypes={["nav-forward"]} className="home-link flex min-h-12 items-center justify-between gap-3 py-2 text-sm font-medium transition-colors hover:text-link">
                      <span>{project.frontmatter.title}</span>
                      <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/projects" transitionTypes={["nav-root"]} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link underline-offset-4 hover:underline">
                View all projects <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </section>

            <section aria-labelledby="current-research-heading" className="home-link-group border-t border-border pt-5">
              <h3 id="current-research-heading" className="font-semibold tracking-[-0.02em]">Current research</h3>
              <ul className="mt-3 divide-y divide-border">
                {currentResearch.map((research) => (
                  <li key={research.frontmatter.slug}>
                    <Link href={`/research/${research.frontmatter.slug}`} transitionTypes={["nav-forward"]} className="home-link flex min-h-12 items-center justify-between gap-3 py-2 text-sm font-medium transition-colors hover:text-link">
                      <span>{research.frontmatter.title}</span>
                      <ArrowRight aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href="/research" transitionTypes={["nav-root"]} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link underline-offset-4 hover:underline">
                View all research <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </section>

            <nav aria-label="Social profiles" className="home-link-group border-t border-border pt-5">
              <p className="font-semibold tracking-[-0.02em]">Connect</p>
              <div className="mt-3 grid">
                <ExternalAnchor className="landing-social-link group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={siteConfig.links.github}>
                  <span><GitHubIcon aria-hidden="true" className="size-5" /></span>
                  <span><span>GitHub</span><span>@vimalselvarajan</span></span>
                  <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </ExternalAnchor>
                <ExternalAnchor className="landing-social-link group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" href={siteConfig.links.linkedin}>
                  <span><LinkedInIcon aria-hidden="true" className="size-5" /></span>
                  <span><span>LinkedIn</span><span>Connect with me</span></span>
                  <ArrowUpRight aria-hidden="true" className="size-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                </ExternalAnchor>
              </div>
            </nav>
          </div>
        </Container>
      </section>
      </div>
  );
}
