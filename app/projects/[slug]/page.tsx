import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContentMeta } from "@/components/content-meta";
import { Container } from "@/components/container";
import { ExternalLink } from "@/components/external-link";
import { MarkdownContent } from "@/components/markdown-content";
import { ProjectDetailImage } from "@/components/project-detail-image";
import { ProjectImageCarousel } from "@/components/project-image-carousel";
import { contentRepository } from "@/lib/content";
import { createContentMetadata } from "@/lib/content-route";
import { contentRoute } from "@/lib/routes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return contentRepository.staticParams("projects");
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return createContentMetadata("projects", slug);
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = contentRepository.get("projects", slug);
  if (!entry) notFound();

  const projects = contentRepository.list("projects");
  const index = projects.findIndex((item) => item.frontmatter.slug === slug);
  const previous = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;
  const position = index + 1;
  const total = projects.length;

  return (
      <article data-scene={entry.frontmatter.slug} className="project-record">
      <header className="project-record-hero">
        <Container className="project-record-hero-inner">
          <Link href="/projects" transitionTypes={["nav-back"]} className="record-back">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to projects
          </Link>
          <div className="record-head-grid">
            <div>
              <p className="eyebrow">Project case study · {String(position).padStart(2, "0")} of {String(total).padStart(2, "0")}</p>
              <h1 className="record-title mt-5">{entry.frontmatter.title}</h1>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] text-subtle">Outcome</p>
              <p className="record-summary">{entry.frontmatter.summary}</p>
            </div>
            <div className="record-utility">
              <ContentMeta items={[{ label: "Tools & technologies", value: entry.frontmatter.stack }]} />
            </div>
          </div>
        </Container>
      </header>

      <Container>
        <div className="record-body-grid">
          <div className="record-body-copy">
            <div className="record-media">
              {entry.frontmatter.gallery
                ? <ProjectImageCarousel {...entry.frontmatter} />
                : <ProjectDetailImage {...entry.frontmatter} />}
            </div>
            <MarkdownContent source={entry.source} route={contentRoute("projects", slug)} />
            <div className="record-end-link">
              <ExternalLink href={entry.frontmatter.github} className="min-h-11">View project on GitHub</ExternalLink>
            </div>
          </div>
          <aside className="record-rail" aria-label="Project context">
            <div className="record-rail-panel">
              <p className="eyebrow">Project archive</p>
              <p className="mt-3">{String(position).padStart(2, "0")} of {String(total).padStart(2, "0")}</p>
            </div>
            <div className="record-rail-panel mt-8">
              <p className="eyebrow">Visual record</p>
              <p className="mt-3">{entry.frontmatter.gallery ? entry.frontmatter.gallery.length + 1 + " documented views" : "Primary project image"}</p>
            </div>
          </aside>
        </div>

        <nav aria-label="Project pagination" className="record-pagination mb-16 sm:mb-24">
          <div>
            {previous ? (
              <Link
                href={contentRoute("projects", previous.frontmatter.slug)}
                transitionTypes={["nav-back"]}
                className="record-pagination-card active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none"
              >
                <span>Previous project</span>
                <span><ArrowLeft aria-hidden="true" className="size-4" />{previous.frontmatter.title}</span>
              </Link>
            ) : null}
          </div>
          <div>
            {next ? (
              <Link
                href={contentRoute("projects", next.frontmatter.slug)}
                transitionTypes={["nav-forward"]}
                data-next="true"
                className="record-pagination-card text-right active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none"
              >
                <span>Next project</span>
                <span>{next.frontmatter.title}<ArrowRight aria-hidden="true" className="size-4" /></span>
              </Link>
            ) : null}
          </div>
        </nav>
      </Container>
      </article>
  );
}
