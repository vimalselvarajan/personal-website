import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FlaskConical } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { Badge } from "@/components/ui/badge";
import { absoluteUrl } from "@/config/site";
import { getAllContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Research",
  description: "Vimal Selvarajan's UC Riverside research in computer architecture, secure processing-in-memory systems, and computational genomics.",
  alternates: { canonical: absoluteUrl("/research") },
};

export default function ResearchPage() {
  const entries = getAllContent("research");

  return (
    <>
      <PageIntro
        eyebrow="Research"
        title="Architecture, security, and computational genomics."
        description="Undergraduate research across three labs at UC Riverside."
      />
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-10 lg:grid-cols-[.75fr_1.25fr]">
          <div>
            <p className="eyebrow">Research focus</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Building faster, safer, and more capable computing systems.</h2>
          </div>
          <ul className="divide-y divide-border border-y border-border">
            {["Microarchitecture simulation", "Secure processing-in-memory", "Long-read genome assembly"].map((interest, index) => (
              <li key={interest} className="grid grid-cols-[2rem_1fr] gap-4 py-6 text-lg leading-8 text-muted-foreground"><span className="text-sm font-semibold text-link">0{index + 1}</span>{interest}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="flex items-center gap-3"><FlaskConical aria-hidden="true" className="size-5 text-link" /><p className="eyebrow">Research areas</p></div>
          <div className="mt-10 divide-y divide-border border-y border-border">
            {entries.map((research) => (
              <article key={research.frontmatter.slug} className="grid gap-8 py-10 lg:grid-cols-[1fr_20rem] lg:items-start">
                <div>
                  <div className="flex flex-wrap gap-2"><Badge>{research.frontmatter.status}</Badge><Badge>{research.frontmatter.researchArea}</Badge></div>
                  <h2 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{research.frontmatter.title}</h2>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">{research.frontmatter.summary}</p>
                  <Link href={`/research/${research.frontmatter.slug}`} className="mt-7 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link hover:underline">Read research overview <ArrowRight aria-hidden="true" className="size-4" /></Link>
                </div>
                <dl className="border-l border-border pl-5 text-sm">
                  <div><dt className="font-semibold">Methods and tools</dt><dd className="mt-2 leading-6 text-muted-foreground">{research.frontmatter.tools.join(" · ")}</dd></div>
                  <div className="mt-5"><dt className="font-semibold">Lab / advisor</dt><dd className="mt-2 leading-6 text-muted-foreground">{research.frontmatter.affiliation}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
