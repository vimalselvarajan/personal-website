import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContentMeta } from "@/components/content-meta";
import { Container } from "@/components/container";
import { MarkdownContent } from "@/components/markdown-content";
import { ResearchImage } from "@/components/research-image";
import { contentRepository } from "@/lib/content";
import { createContentMetadata } from "@/lib/content-route";
import { contentRoute } from "@/lib/routes";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return contentRepository.staticParams("research");
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return createContentMetadata("research", slug);
}

export default async function ResearchDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = contentRepository.get("research", slug);
  if (!entry) notFound();

  const research = contentRepository.list("research");
  const index = research.findIndex((item) => item.frontmatter.slug === slug);
  const previous = index > 0 ? research[index - 1] : null;
  const next = index < research.length - 1 ? research[index + 1] : null;
  const position = index + 1;
  const total = research.length;

  return (
      <article className="research-record">
      <header className="research-record-hero">
        <Container className="research-record-hero-inner">
          <Link href="/research" transitionTypes={["nav-back"]} className="record-back">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Back to research
          </Link>
          <div className="record-head-grid">
            <div>
              <p className="eyebrow">Research brief · {String(position).padStart(2, "0")} of {String(total).padStart(2, "0")}</p>
              <h1 className="record-title mt-5">{entry.frontmatter.title}</h1>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.14em] opacity-70">Current focus</p>
              <p className="record-summary">{entry.frontmatter.summary}</p>
            </div>
            <div className="record-utility">
              <ContentMeta items={[
                { label: "Area", value: entry.frontmatter.researchArea },
                { label: "Status", value: entry.frontmatter.status },
                { label: "Lab / advisor", value: entry.frontmatter.affiliation },
                { label: "Methods & tools", value: entry.frontmatter.tools },
              ]} />
            </div>
          </div>
        </Container>
      </header>

      <Container>
        {entry.frontmatter.image ? (
          <figure className="mt-10 overflow-hidden rounded-2xl border border-border bg-white p-2 shadow-[var(--surface-shadow)] sm:mt-14">
            <ResearchImage
              research={entry.frontmatter}
              sizes="(min-width: 1280px) 1120px, calc(100vw - 4rem)"
              className="h-auto w-full rounded-xl"
            />
            <figcaption className="px-3 pb-2 pt-4 text-sm text-slate-600">
              MTP Lite genome assembly optimization poster
            </figcaption>
          </figure>
        ) : null}
        <div className="record-body-grid">
          <div className="record-body-copy">
            <MarkdownContent source={entry.source} route={contentRoute("research", slug)} />
          </div>
          <aside className="record-rail" aria-label="Research context">
            <div className="record-rail-panel">
              <p className="eyebrow">Research archive</p>
              <p className="mt-3">{String(position).padStart(2, "0")} of {String(total).padStart(2, "0")}</p>
            </div>
            <div className="record-rail-panel mt-8">
              <p className="eyebrow">Lab / advisor</p>
              <p className="mt-3">{entry.frontmatter.affiliation}</p>
            </div>
          </aside>
        </div>

        <nav aria-label="Research pagination" className="record-pagination mb-16 sm:mb-24">
          <div>
            {previous ? (
              <Link
                href={contentRoute("research", previous.frontmatter.slug)}
                transitionTypes={["nav-back"]}
                className="record-pagination-card active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none"
              >
                <span>Previous research</span>
                <span><ArrowLeft aria-hidden="true" className="size-4" />{previous.frontmatter.title}</span>
              </Link>
            ) : null}
          </div>
          <div>
            {next ? (
              <Link
                href={contentRoute("research", next.frontmatter.slug)}
                transitionTypes={["nav-forward"]}
                data-next="true"
                className="record-pagination-card text-right active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none"
              >
                <span>Next research</span>
                <span>{next.frontmatter.title}<ArrowRight aria-hidden="true" className="size-4" /></span>
              </Link>
            ) : null}
          </div>
        </nav>
      </Container>
      </article>
  );
}
