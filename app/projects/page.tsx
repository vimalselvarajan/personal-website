import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Container } from "@/components/container";
import { ExternalAnchor } from "@/components/external-link";
import { ProjectCardImage } from "@/components/project-card-image";
import { ProjectImageCarousel } from "@/components/project-image-carousel";
import { Badge } from "@/components/ui/badge";
import { contentRepository } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  path: "/projects",
  title: "Projects",
  description: "Projects by Vimal Selvarajan spanning C++, PCB design, embedded systems, test automation, and bioinformatics.",
});

function requireProject(slug: string) {
  const project = contentRepository.get("projects", slug);
  if (!project) throw new Error(`Missing curated project: ${slug}`);
  return project;
}

const featuredProjectSlots = [
  "mtp-lite",
  "hastest-control-suite",
  null,
] as const;

export default function ProjectsPage() {
  const featuredProjects = featuredProjectSlots.map((slug) => slug ? requireProject(slug) : null);
  const additionalProjects = [
    requireProject("12v-to-3v3-buck-converter"),
    requireProject("driver-interfaces"),
    requireProject("mini-genome-assembler"),
  ];

  return (
      <section className="atlas-page" aria-labelledby="projects-page-heading">
      <Container>
        <header className="atlas-heading projects-heading">
          <p className="eyebrow">Selected engineering work</p>
          <h1 id="projects-page-heading">Systems built across hardware and software.</h1>
          <p className="projects-heading-copy text-pretty text-muted-foreground">
            A focused collection spanning long-running validation, power electronics, embedded interfaces, and bioinformatics algorithms.
          </p>
          <div className="atlas-register">Project collection</div>
        </header>

        <section aria-label="Project index">
          <div className="project-atlas project-featured-grid">
            {featuredProjects.map((project, index) => (
              project ? (
              <article
                key={project.frontmatter.slug}
                data-scene={project.frontmatter.slug}
                data-layout={index % 2 === 0 ? "forward" : "reverse"}
                className="atlas-scene"
              >
                <div className="atlas-scene-visual">
                  {project.frontmatter.slug === "hastest-control-suite" ? (
                    <div className="atlas-carousel">
                      <ProjectImageCarousel {...project.frontmatter} preload />
                    </div>
                  ) : (
                    <div className="atlas-media">
                      <ProjectCardImage
                        project={project.frontmatter}
                      />
                    </div>
                  )}
                </div>
                <div className="atlas-scene-copy">
                  <p className="atlas-scene-index">{String(index + 1).padStart(2, "0")}</p>
                  <h2 className="atlas-scene-title">{project.frontmatter.title}</h2>
                  <p className="atlas-scene-summary">{project.frontmatter.summary}</p>
                  <div className="atlas-scene-stack">
                    {project.frontmatter.stack.map((technology) => <Badge key={technology}>{technology}</Badge>)}
                  </div>
                  <div className="atlas-scene-links">
                    <Link href={`/projects/${project.frontmatter.slug}`} transitionTypes={["nav-forward"]} className="atlas-inline-link atlas-inline-link-primary">
                      Project details <ArrowRight aria-hidden="true" className="size-4" />
                    </Link>
                    <ExternalAnchor href={project.frontmatter.github} className="atlas-inline-link">
                      GitHub <ArrowUpRight aria-hidden="true" className="size-4" />
                    </ExternalAnchor>
                  </div>
                </div>
              </article>
              ) : (
                <article
                  key="reserved-project-slot"
                  data-scene="reserved-project-slot"
                  data-layout={index % 2 === 0 ? "forward" : "reverse"}
                  className="atlas-scene atlas-scene-placeholder"
                  aria-labelledby="reserved-project-heading"
                >
                  <div className="atlas-scene-visual">
                    <div className="atlas-placeholder-media" aria-hidden="true">
                      <span className="atlas-placeholder-mark">03</span>
                    </div>
                  </div>
                  <div className="atlas-scene-copy">
                    <p className="atlas-scene-index">{String(index + 1).padStart(2, "0")}</p>
                    <h2 id="reserved-project-heading" className="atlas-scene-title">Project in progress</h2>
                    <p className="atlas-scene-summary">Reserved for the next featured build.</p>
                  </div>
                </article>
              )
            ))}
          </div>

          <section aria-labelledby="additional-projects-heading" className="project-compact-section pb-16 sm:pb-24">
            <header className="max-w-3xl border-t border-border pt-8">
              <p className="eyebrow">Also in the collection</p>
              <h2 id="additional-projects-heading" className="mt-4 text-balance text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
                Focused builds and algorithms.
              </h2>
            </header>
            <div className="project-compact-list mt-10 grid gap-4 lg:grid-cols-2">
              {additionalProjects.map((project, index) => (
                <article
                  key={project.frontmatter.slug}
                  data-scene={project.frontmatter.slug}
                  className="project-compact-entry grid grid-cols-[minmax(7.5rem,11rem)_minmax(0,1fr)] gap-5 overflow-hidden rounded-[1.75rem] border border-border bg-surface p-4 shadow-[var(--surface-shadow)] sm:p-5"
                >
                  <div className="project-compact-media relative aspect-square self-start overflow-hidden rounded-2xl bg-muted">
                    <ProjectCardImage project={project.frontmatter} sizes="11rem" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-semibold tracking-[0.1em] text-link">
                      {String(index + featuredProjectSlots.length + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-2 text-balance text-xl font-semibold leading-tight tracking-[-0.035em] sm:text-2xl">
                      {project.frontmatter.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{project.frontmatter.summary}</p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {project.frontmatter.stack.slice(0, 3).map((technology) => <Badge key={technology}>{technology}</Badge>)}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold">
                      <Link href={`/projects/${project.frontmatter.slug}`} transitionTypes={["nav-forward"]} className="inline-flex min-h-11 items-center gap-2 text-link underline-offset-4 hover:underline">
                        Project details <ArrowRight aria-hidden="true" className="size-4" />
                      </Link>
                      <ExternalAnchor href={project.frontmatter.github} className="inline-flex min-h-11 items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                        GitHub <ArrowUpRight aria-hidden="true" className="size-4" />
                      </ExternalAnchor>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </section>
      </Container>
      </section>
  );
}
