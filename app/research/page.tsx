import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { Container } from "@/components/container";
import { Badge } from "@/components/ui/badge";
import { ResearchImage } from "@/components/research-image";
import { contentRepository } from "@/lib/content";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata({
  path: "/research",
  title: "Research",
  description: "Vimal Selvarajan's UC Riverside research in computer architecture, secure processing-in-memory systems, and computational genomics.",
});

function requireResearch(slug: string) {
  const research = contentRepository.get("research", slug);
  if (!research) throw new Error(`Missing curated research entry: ${slug}`);
  return research;
}

export default function ResearchPage() {
  const mtpLite = requireResearch("optimal-read-selection");
  const additionalResearch = [
    requireResearch("adaptive-cache-warming"),
    requireResearch("secure-processing-in-memory"),
  ];

  return (
      <section aria-labelledby="research-page-heading" className="atlas-page">
      <Container className="pb-16 sm:pb-24">
        <header className="atlas-heading research-heading">
          <div className="flex items-center gap-3">
            <FlaskConical aria-hidden="true" className="size-5 text-link" />
            <p className="eyebrow">Research at UC Riverside</p>
          </div>
          <h1 id="research-page-heading">Research with measurable outcomes.</h1>
          <p className="research-heading-copy text-pretty text-muted-foreground">
            Computational genomics, microarchitecture simulation, and secure systems—presented by result, method, and current direction.
          </p>
          <div className="atlas-register">Research collection</div>
        </header>

        <section aria-labelledby="mtp-lite-heading" className="research-feature mt-14 overflow-hidden rounded-[2rem] border border-border bg-surface p-6 shadow-[var(--surface-shadow)] sm:mt-20 sm:p-9 lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.62fr)] lg:items-end">
            <div className="research-feature-copy">
              <div className="flex flex-wrap gap-2">
                <Badge>{mtpLite.frontmatter.status}</Badge>
                <Badge>{mtpLite.frontmatter.researchArea}</Badge>
              </div>
              <p className="eyebrow mt-8">Lead result</p>
              <h2 id="mtp-lite-heading" className="mt-4 max-w-3xl text-balance text-[clamp(2.65rem,6vw,5.5rem)] font-semibold leading-[0.92] tracking-[-0.065em]">
                {mtpLite.frontmatter.title}
              </h2>
              <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground">
                {mtpLite.frontmatter.summary}
              </p>
              <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
                {mtpLite.frontmatter.affiliation}
              </p>
              <Link href={`/research/${mtpLite.frontmatter.slug}`} transitionTypes={["nav-forward"]} className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link underline-offset-4 hover:underline">
                Read the MTP Lite overview <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <dl className="research-metrics grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              <div className="research-metric rounded-2xl border border-border bg-background p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Assembly fragmentation</dt>
                <dd className="mt-2 text-4xl font-semibold tracking-[-0.055em] text-link">91% lower</dd>
              </div>
              <div className="research-metric rounded-2xl border border-border bg-background p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Genome fraction</dt>
                <dd className="mt-2 text-3xl font-semibold tracking-[-0.045em]">99.9%</dd>
              </div>
              <div className="research-metric rounded-2xl border border-border bg-background p-5">
                <dt className="text-xs font-semibold uppercase tracking-[0.09em] text-subtle">Sequence identity</dt>
                <dd className="mt-2 text-3xl font-semibold tracking-[-0.045em]">99.9%</dd>
              </div>
            </dl>
          </div>
          {mtpLite.frontmatter.image ? (
            <figure className="mt-10 overflow-hidden rounded-2xl border border-border bg-white p-2">
              <ResearchImage
                research={mtpLite.frontmatter}
                sizes="(min-width: 1280px) 1120px, calc(100vw - 4rem)"
                className="h-auto w-full rounded-xl"
              />
            </figure>
          ) : null}
        </section>

        <section aria-labelledby="current-directions-heading" className="research-compact-section mt-16 sm:mt-24">
          <header className="max-w-3xl">
            <p className="eyebrow">Current directions</p>
            <h2 id="current-directions-heading" className="mt-4 text-balance text-[clamp(2.25rem,5vw,4.5rem)] font-semibold leading-[0.95] tracking-[-0.06em]">
              Architecture, simulation, and security.
            </h2>
          </header>

          <div className="research-compact-list mt-10 border-y border-border">
            {additionalResearch.map((research, index) => (
              <article key={research.frontmatter.slug} className="research-compact-entry grid gap-5 border-b border-border py-8 last:border-b-0 lg:grid-cols-[5rem_minmax(0,1fr)_minmax(15rem,0.45fr)] lg:gap-10">
                <p className="font-mono text-xs font-semibold tracking-[0.1em] text-link">
                  {String(index + 2).padStart(2, "0")}
                </p>
                <div>
                  <div className="flex flex-wrap gap-2">
                    <Badge>{research.frontmatter.status}</Badge>
                    <Badge>{research.frontmatter.researchArea}</Badge>
                  </div>
                  <h3 className="mt-4 max-w-2xl text-balance text-2xl font-semibold leading-tight tracking-[-0.04em] sm:text-3xl">
                    {research.frontmatter.title}
                  </h3>
                  <p className="mt-4 max-w-2xl leading-7 text-muted-foreground">{research.frontmatter.summary}</p>
                  <Link href={`/research/${research.frontmatter.slug}`} transitionTypes={["nav-forward"]} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link underline-offset-4 hover:underline">
                    Read research overview <ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
                <dl className="self-end border-t border-border pt-4 text-sm">
                  <div>
                    <dt className="font-semibold">Methods and tools</dt>
                    <dd className="mt-2 leading-6 text-muted-foreground">{research.frontmatter.tools.slice(0, 5).join(" · ")}</dd>
                  </div>
                  <div className="mt-5">
                    <dt className="font-semibold">Lab / advisor</dt>
                    <dd className="mt-2 leading-6 text-muted-foreground">{research.frontmatter.affiliation}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>
      </Container>
      </section>
  );
}
