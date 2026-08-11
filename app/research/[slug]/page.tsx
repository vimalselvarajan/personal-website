import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { ContentMeta } from "@/components/content-meta";
import { MdxContent } from "@/components/mdx-content";
import { absoluteUrl } from "@/config/site";
import { getContentEntry, getContentSlugs } from "@/lib/content";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getContentSlugs("research").map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entry = getContentEntry("research", slug);
  if (!entry) return { title: "Research not found" };
  return {
    title: entry.frontmatter.title,
    description: entry.frontmatter.summary,
    alternates: { canonical: absoluteUrl(`/research/${slug}`) },
  };
}

export default async function ResearchDetailPage({ params }: Props) {
  const { slug } = await params;
  const entry = getContentEntry("research", slug);
  if (!entry) notFound();

  return (
    <article>
      <header className="border-b border-border bg-primary text-primary-foreground">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <Link href="/research" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-foreground/75 hover:text-primary-foreground"><ArrowLeft aria-hidden="true" className="size-4" />All research</Link>
          <p className="mt-10 text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/55">Research at UC Riverside</p>
          <h1 className="mt-5 max-w-5xl text-balance text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">{entry.frontmatter.title}</h1>
          <p className="mt-7 max-w-3xl text-xl leading-8 text-primary-foreground/70">{entry.frontmatter.summary}</p>
          <div className="mt-10 [&_dl]:border-primary-foreground/20 [&_dd]:text-primary-foreground [&_dt]:text-primary-foreground/50 [&_span]:border-primary-foreground/20 [&_span]:bg-primary-foreground/10 [&_span]:text-primary-foreground">
            <ContentMeta items={[
              { label: "Area", value: entry.frontmatter.researchArea },
              { label: "Status", value: entry.frontmatter.status },
              { label: "Lab / advisor", value: entry.frontmatter.affiliation },
              { label: "Methods and tools", value: entry.frontmatter.tools },
            ]} />
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <MdxContent source={entry.source} />
      </div>
    </article>
  );
}
