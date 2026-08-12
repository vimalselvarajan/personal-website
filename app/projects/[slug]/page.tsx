import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContentMeta } from "@/components/content-meta";
import { Container } from "@/components/container";
import { ExternalLink } from "@/components/external-link";
import { MarkdownContent } from "@/components/markdown-content";
import { ProjectDetailImage } from "@/components/project-detail-image";
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

  return (
    <article>
      <header className="border-b border-border bg-surface">
        <Container className="py-14 sm:py-20">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"><ArrowLeft aria-hidden="true" className="size-4" />All projects</Link>
          <p className="mt-10 eyebrow">Project {String(index + 1).padStart(2, "0")}</p>
          <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">{entry.frontmatter.title}</h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-muted-foreground">{entry.frontmatter.summary}</p>
          <div className="mt-10"><ContentMeta items={[{ label: "Technologies", value: entry.frontmatter.stack }]} /></div>
        </Container>
      </header>
      <Container className="py-14 sm:py-20">
        <div className="mb-14 overflow-hidden rounded-[2rem] border border-border bg-white p-2 sm:p-4">
          <ProjectDetailImage {...entry.frontmatter} />
        </div>
        <MarkdownContent source={entry.source} route={contentRoute("projects", slug)} />
        <div className="mt-16 border-t border-border pt-8 text-sm font-semibold"><ExternalLink href={entry.frontmatter.github}>View project on GitHub</ExternalLink></div>
        <nav aria-label="Project pagination" className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          <div>{previous ? <Link href={`/projects/${previous.frontmatter.slug}`} className="group block rounded-2xl border border-border p-5 hover:bg-muted"><span className="text-xs text-subtle">Previous project</span><span className="mt-2 flex items-center gap-2 font-semibold"><ArrowLeft aria-hidden="true" className="size-4" />{previous.frontmatter.title}</span></Link> : null}</div>
          <div>{next ? <Link href={`/projects/${next.frontmatter.slug}`} className="group block rounded-2xl border border-border p-5 text-right hover:bg-muted"><span className="text-xs text-subtle">Next project</span><span className="mt-2 flex items-center justify-end gap-2 font-semibold">{next.frontmatter.title}<ArrowRight aria-hidden="true" className="size-4" /></span></Link> : null}</div>
        </nav>
      </Container>
    </article>
  );
}
