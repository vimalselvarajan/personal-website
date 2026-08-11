import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Code2, Mail, Network } from "lucide-react";
import { PageIntro } from "@/components/page-intro";
import { Container } from "@/components/container";
import { Button } from "@/components/ui/button";
import { absoluteUrl, siteConfig } from "@/config/site";
import { researchExperience } from "@/lib/resume-data";

export const metadata: Metadata = {
  title: "About",
  description: "About Vimal Selvarajan, a UC Riverside computer science student researching computer architecture, secure systems, and computational genomics.",
  alternates: { canonical: absoluteUrl("/about") },
};

export default function AboutPage() {
  return (
    <>
      <PageIntro eyebrow="About" title="Research across the computing stack." description={siteConfig.bio} />
      <Container as="section" className="py-16 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-[1fr_22rem]">
          <div className="max-w-3xl">
            <section aria-labelledby="research-heading">
              <p className="eyebrow">Research</p>
              <h2 id="research-heading" className="mt-4 text-3xl font-semibold tracking-[-0.04em]">Three labs at UC Riverside.</h2>
              <div className="mt-7 divide-y divide-border border-y border-border">
                {researchExperience.map((experience) => (
                  <div key={experience.organization} className="py-6">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <h3 className="font-semibold">{experience.organization.split(",")[0]}</h3>
                      <p className="text-sm text-muted-foreground">{experience.dates}</p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{experience.highlights[0]}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
          <aside className="self-start rounded-[1.75rem] border border-border bg-surface p-6 lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-subtle">Connect</p>
            <div className="mt-5 grid gap-2">
              <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between rounded-xl px-3 font-medium hover:bg-muted"><span className="flex items-center gap-3"><Code2 aria-hidden="true" className="size-4 text-link" />GitHub</span><ArrowUpRight aria-hidden="true" className="size-4" /></a>
              <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="flex min-h-12 items-center justify-between rounded-xl px-3 font-medium hover:bg-muted"><span className="flex items-center gap-3"><Network aria-hidden="true" className="size-4 text-link" />LinkedIn</span><ArrowUpRight aria-hidden="true" className="size-4" /></a>
              <a href={siteConfig.links.email} className="flex min-h-12 items-center justify-between rounded-xl px-3 font-medium hover:bg-muted"><span className="flex items-center gap-3"><Mail aria-hidden="true" className="size-4 text-link" />Email</span><ArrowRight aria-hidden="true" className="size-4" /></a>
            </div>
            <Button asChild className="mt-6 w-full"><Link href={siteConfig.links.resume}>View résumé <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
          </aside>
        </div>
      </Container>
    </>
  );
}
