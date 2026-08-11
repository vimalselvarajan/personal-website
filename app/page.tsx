import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/section-heading";
import { absoluteUrl, siteConfig } from "@/config/site";
import { getAllContent, getContentEntry } from "@/lib/content";
import { resumeData } from "@/lib/resume-data";

export const metadata: Metadata = {
  title: { absolute: siteConfig.metadata.title },
  description: siteConfig.metadata.description,
  alternates: { canonical: absoluteUrl() },
};

export default function HomePage() {
  const project = getContentEntry("projects", siteConfig.featured.projectSlug);
  const research = getContentEntry("research", siteConfig.featured.researchSlug);
  const projects = getAllContent("projects");
  const researchEntries = getAllContent("research");
  if (!project || !research) throw new Error("Featured content slugs in config/site.ts must match MDX entries.");

  return (
    <>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,color-mix(in_oklab,var(--link)_12%,transparent),transparent_33%)]" aria-hidden="true" />
        <div className="relative mx-auto grid min-h-[calc(100svh-4rem)] max-w-7xl content-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:py-20">
          <div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{siteConfig.name}</span>
              <span className="inline-flex items-center gap-1.5"><GraduationCap aria-hidden="true" className="size-4" />{siteConfig.university}</span>
            </div>
            <p className="mt-12 eyebrow">{siteConfig.role}</p>
            <h1 className="mt-5 max-w-5xl text-balance text-[clamp(3.35rem,9vw,7.8rem)] font-semibold leading-[0.9] tracking-[-0.075em]">
              {siteConfig.headline}
            </h1>
            <p className="mt-8 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">{siteConfig.introduction}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild><Link href="/projects">View projects <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
              <Button asChild variant="secondary"><Link href="/research">View research</Link></Button>
              <Button asChild variant="ghost"><Link href={siteConfig.links.resume}>Résumé <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
            </div>
            <div className="mt-8 flex gap-5 text-sm">
              <a className="inline-flex items-center gap-1 text-link hover:underline" href={siteConfig.links.github} target="_blank" rel="noreferrer">GitHub <ArrowUpRight aria-hidden="true" className="size-3.5" /></a>
              <a className="inline-flex items-center gap-1 text-link hover:underline" href={siteConfig.links.linkedin} target="_blank" rel="noreferrer">LinkedIn <ArrowUpRight aria-hidden="true" className="size-3.5" /></a>
            </div>
          </div>
          <div className="hidden self-end border-l border-border pl-8 lg:block">
            <p className="text-xs font-semibold uppercase tracking-[0.13em] text-subtle">At a glance</p>
            <dl className="mt-6 space-y-6">
              <div><dt className="text-xs text-muted-foreground">Focus</dt><dd className="mt-1 font-medium">Computer architecture<br />Secure PIM systems<br />Computational genomics</dd></div>
              <div><dt className="text-xs text-muted-foreground">Education</dt><dd className="mt-1 font-medium">B.S. Computer Science<br />M.S. Electrical Engineering (planned)</dd></div>
              <div><dt className="text-xs text-muted-foreground">Portfolio</dt><dd className="mt-1 font-medium">{projects.length} projects<br />{researchEntries.length} research areas</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading eyebrow="Featured project" title="Hardware designed for a stable 3.3V output." description="A compact power-supply project built around the TPS54202H." />
        <article className="mt-12 grid gap-8 lg:grid-cols-[1.05fr_.95fr] lg:items-center">
          <div className="overflow-hidden rounded-[2rem] border border-border bg-white">
            <Image
              src={project.frontmatter.image}
              alt={project.frontmatter.imageAlt}
              width={project.frontmatter.imageWidth}
              height={project.frontmatter.imageHeight}
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="h-auto w-full object-cover"
              fetchPriority="high"
            />
          </div>
          <div className="lg:pl-10">
            <Badge>PCB design</Badge>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{project.frontmatter.title}</h3>
            <p className="mt-5 text-lg leading-8 text-muted-foreground">{project.frontmatter.summary}</p>
            <dl className="mt-7 grid gap-5 border-l border-border pl-5 text-sm">
              <div><dt className="font-semibold text-foreground">Design</dt><dd className="mt-1 text-muted-foreground">12V input to a stable 3.3V output</dd></div>
              <div><dt className="font-semibold text-foreground">Controller</dt><dd className="mt-1 text-muted-foreground">TPS54202H</dd></div>
              <div><dt className="font-semibold text-foreground">Output current</dt><dd className="mt-1 text-muted-foreground">Up to 2A</dd></div>
            </dl>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <Button asChild variant="link"><Link href={`/projects/${project.frontmatter.slug}`}>Read the project <ArrowRight aria-hidden="true" className="size-4" /></Link></Button>
              <a href={project.frontmatter.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">GitHub <ArrowUpRight aria-hidden="true" className="size-4" /></a>
            </div>
          </div>
        </article>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/60">Featured research</p>
            <h2 className="mt-5 text-balance text-4xl font-semibold tracking-[-0.055em] sm:text-6xl">Genome assembly at ultra-deep coverage.</h2>
          </div>
          <article className="border-t border-primary-foreground/20 pt-7 lg:mt-2">
            <p className="text-sm text-primary-foreground/60">{research.frontmatter.researchArea} · {research.frontmatter.status}</p>
            <h3 className="mt-5 text-3xl font-semibold tracking-[-0.04em]">{research.frontmatter.title}</h3>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-primary-foreground/70">{research.frontmatter.summary}</p>
            <dl className="mt-7 grid gap-5 sm:grid-cols-2">
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/50">Approach</dt><dd className="mt-2 text-sm leading-6">Optimal read selection using single-copy k-mers from ultra-deep sequencing data.</dd></div>
              <div><dt className="text-xs font-semibold uppercase tracking-wide text-primary-foreground/50">Lab / advisor</dt><dd className="mt-2 text-sm leading-6">{research.frontmatter.affiliation}</dd></div>
            </dl>
            <Link href={`/research/${research.frontmatter.slug}`} className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-foreground/25 px-5 text-sm font-semibold hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground">Explore the research <ArrowRight aria-hidden="true" className="size-4" /></Link>
          </article>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
          <SectionHeading eyebrow="Current experience" title="Research across architecture and genomics." description="Three concurrent undergraduate research appointments at UC Riverside." />
          <div className="mt-12 grid gap-px overflow-hidden rounded-[2rem] border border-border bg-border lg:grid-cols-3">
            {resumeData.experience.slice(0, 3).map((experience) => (
              <article key={experience.organization} className="bg-background p-7 sm:p-8">
                <p className="text-sm font-semibold text-link">{experience.dates}</p>
                <h3 className="mt-4 text-xl font-semibold tracking-[-0.03em]">{experience.organization.split(",")[0]}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{experience.role}</p>
                <p className="mt-6 text-sm leading-6 text-muted-foreground">{experience.highlights[0]}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-28">
        <SectionHeading eyebrow="Technical foundation" title="Skills across architecture, hardware, software, and genomics." />
        <div className="mt-12 divide-y divide-border border-y border-border">
          {resumeData.skills.map((group) => (
            <div key={group.category} className="grid gap-4 py-7 sm:grid-cols-[15rem_1fr] sm:items-start">
              <h3 className="font-semibold">{group.category}</h3>
              <ul className="flex flex-wrap gap-x-6 gap-y-3 text-muted-foreground">{group.items.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-20 sm:px-8 lg:grid-cols-[.65fr_1.35fr] lg:py-24">
          <div>
            <div className="flex items-center gap-3"><GraduationCap aria-hidden="true" className="size-5 text-link" /><p className="eyebrow">Education</p></div>
            <h2 className="mt-6 text-3xl font-semibold tracking-[-0.04em]">{siteConfig.university}</h2>
            <div className="mt-5 space-y-4">
              {resumeData.education.map((education) => (
                <div key={education.degree}>
                  <p className="font-medium">{education.degree}{education.planned ? " (planned)" : ""}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{education.dates}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="eyebrow">Research at UCR</p>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground">Working in the Brisk, Sadredini, and Lonardi labs on microarchitecture simulation, secure processing-in-memory systems, and k-mer-based genome assembly optimization.</p>
          </div>
        </div>
      </section>
    </>
  );
}
