import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Code2, Mail, Network } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/container";
import { ExternalAnchor } from "@/components/external-link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/metadata";
import { researchExperience } from "@/lib/resume-data";

export const metadata: Metadata = createPageMetadata({
  path: "/about",
  title: "About",
  description: "About Vimal Selvarajan, a UC Riverside computer science student researching computer architecture, secure systems, and computational genomics.",
});

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About" title="Research across the computing stack." description={siteConfig.bio} />
      <Container as="section" aria-label="Research labs and contact information" className="about-record">
        <section aria-labelledby="research-heading" className="max-w-3xl">
          <p className="eyebrow">Research</p>
          <h2 id="research-heading" className="archive-title mt-4 text-[clamp(2.4rem,5vw,4.6rem)]">Three labs at UC Riverside.</h2>
          <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-muted-foreground sm:text-lg">
            I move between architecture, security, and genomics with the same approach: make the system measurable, build the tooling, and validate the result.
          </p>
          <div className="about-research-list">
            {researchExperience.map((experience, index) => (
              <article key={experience.organization} className="about-research-item">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="font-semibold tracking-[-0.02em]"><span className="mr-3 font-mono text-xs text-link">{String(index + 1).padStart(2, "0")}</span>{experience.organization.split(",")[0]}</h3>
                  <p className="text-sm text-muted-foreground">{experience.dates}</p>
                </div>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{experience.highlights[0]}</p>
                <Link
                  href={experience.relatedWork.href}
                  transitionTypes={["nav-forward"]}
                  className="mt-1 inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-link underline-offset-4 hover:underline"
                >
                  {experience.relatedWork.label}
                  <ArrowRight aria-hidden="true" className="size-4" />
                </Link>
              </article>
            ))}
          </div>
        </section>
        <aside className="about-connect" aria-labelledby="connect-heading">
          <p className="eyebrow">Contact</p>
          <h2 id="connect-heading" className="mt-3 text-2xl font-semibold tracking-[-0.04em]">Let&apos;s connect.</h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Review my work, professional history, or reach me directly.</p>
          <div className="mt-5 grid gap-2">
            <ExternalAnchor href={siteConfig.links.github} className="flex min-h-12 items-center justify-between rounded-xl px-3 font-medium transition-colors hover:bg-foreground/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-3"><Code2 aria-hidden="true" className="size-4 text-link" />GitHub</span><ArrowUpRight aria-hidden="true" className="size-4" /></ExternalAnchor>
            <ExternalAnchor href={siteConfig.links.linkedin} className="flex min-h-12 items-center justify-between rounded-xl px-3 font-medium transition-colors hover:bg-foreground/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-3"><Network aria-hidden="true" className="size-4 text-link" />LinkedIn</span><ArrowUpRight aria-hidden="true" className="size-4" /></ExternalAnchor>
            <a href={siteConfig.links.email} className="flex min-h-12 items-center justify-between rounded-xl px-3 font-medium transition-colors hover:bg-foreground/7 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="flex items-center gap-3"><Mail aria-hidden="true" className="size-4 text-link" />Email</span><ArrowRight aria-hidden="true" className="size-4" /></a>
          </div>
          <Button asChild className="mt-6 h-auto min-h-11 w-full flex-wrap py-3 text-center leading-snug"><Link href={siteConfig.links.resume} transitionTypes={["nav-root"]}>View full résumé <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
        </aside>
      </Container>
    </>
  );
}
