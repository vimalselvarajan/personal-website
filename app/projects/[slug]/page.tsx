import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { ContentMeta } from "@/components/content-meta";
import { ExternalLink } from "@/components/external-link";
import { MdxContent } from "@/components/mdx-content";
import { absoluteUrl } from "@/config/site";
import { getAllContent, getContentEntry, getContentSlugs } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getContentSlugs("projects").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getContentEntry("projects", slug);
  if (!entry) return { title: "Project not found" };
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary,
    alternates: { canonical: absoluteUrl(`/projects/${slug}`) },
  };
}

export default async function ProjectDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = getContentEntry("projects", slug);
  if (!entry) notFound();

  const projects = getAllContent("projects");
  const index = projects.findIndex((item) => item.frontmatter.slug === slug);
  const previous = index > 0 ? projects[index - 1] : null;
  const next = index < projects.length - 1 ? projects[index + 1] : null;

  return (
    <article>
      <header className="border-b border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <Link href="/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-link hover:underline"><ArrowLeft aria-hidden="true" className="size-4" />All projects</Link>
          <p className="mt-10 eyebrow">Project {String(index + 1).padStart(2, "0")}</p>
          <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">{entry.frontmatter.title}</h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-muted-foreground">{entry.frontmatter.summary}</p>
          <div className="mt-10"><ContentMeta items={[{ label: "Technologies", value: entry.frontmatter.stack }]} /></div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="mb-14 overflow-hidden rounded-[2rem] border border-border bg-white p-2 sm:p-4">
          <Image
            src={entry.frontmatter.image}
            alt={entry.frontmatter.imageAlt}
            width={entry.frontmatter.imageWidth}
            height={entry.frontmatter.imageHeight}
            sizes="(min-width: 1280px) 1152px, 100vw"
            className="mx-auto max-h-[42rem] h-auto w-auto max-w-full rounded-2xl object-contain"
          />
        </div>
        <MdxContent source={entry.source} />
        <div className="mt-16 border-t border-border pt-8 text-sm font-semibold"><ExternalLink href={entry.frontmatter.github}>View project on GitHub</ExternalLink></div>
        <nav aria-label="Project pagination" className="mt-16 grid gap-4 border-t border-border pt-8 sm:grid-cols-2">
          <div>{previous ? <Link href={`/projects/${previous.frontmatter.slug}`} className="group block rounded-2xl border border-border p-5 hover:bg-muted"><span className="text-xs text-subtle">Previous project</span><span className="mt-2 flex items-center gap-2 font-semibold"><ArrowLeft aria-hidden="true" className="size-4" />{previous.frontmatter.title}</span></Link> : null}</div>
          <div>{next ? <Link href={`/projects/${next.frontmatter.slug}`} className="group block rounded-2xl border border-border p-5 text-right hover:bg-muted"><span className="text-xs text-subtle">Next project</span><span className="mt-2 flex items-center justify-end gap-2 font-semibold">{next.frontmatter.title}<ArrowRight aria-hidden="true" className="size-4" /></span></Link> : null}</div>
        </nav>
      </div>
    </article>
  );
}
