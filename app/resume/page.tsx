import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, GraduationCap, Mail, MapPin, Mic2, Phone } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/brand-icons";
import { Container } from "@/components/container";
import { ExternalAnchor } from "@/components/external-link";
import { ResumeTimeline } from "@/components/resume-timeline";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { createPageMetadata } from "@/lib/metadata";
import { resumeData, type ExperienceId } from "@/lib/resume-data";

export const metadata: Metadata = createPageMetadata({
  path: "/resume",
  title: "Résumé",
  description: "Résumé for Vimal Selvarajan, a UC Riverside computer science student and undergraduate researcher.",
});

function ExperienceAnchor({ id }: { id: ExperienceId }) {
  const experience = resumeData.experience.find((entry) => entry.id === id);
  if (!experience) return null;

  return (
    <a
      href={"#experience-" + experience.id}
      className="inline-flex min-h-11 items-center rounded-full border border-border bg-background px-3 text-xs font-semibold text-muted-foreground transition-colors hover:border-link/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {experience.shortLabel}
    </a>
  );
}

export default function ResumePage() {
  return (
      <article className="resume-page">
      <header className="resume-hero relative overflow-hidden border-b">
        <div className="resume-signal-grid absolute inset-0" aria-hidden="true" />
        <div className="resume-hero-orb absolute -right-32 -top-32 size-[30rem] rounded-full" aria-hidden="true" />

        <Container className="resume-hero-inner relative py-16 sm:py-20 lg:py-24">
          <div className="max-w-5xl">
            <p className="resume-hero-kicker text-xs font-bold uppercase tracking-[0.16em]">Résumé</p>
            <h1 className="resume-hero-title mt-5">
              {siteConfig.name}
            </h1>
            <p className="resume-hero-copy mt-7 max-w-3xl text-lg leading-8 sm:text-xl">
              UC Riverside computer science student and undergraduate researcher translating low-level systems work into measured, reproducible engineering outcomes.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <a href={resumeData.contact.emailHref} className="resume-hero-contact inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-semibold">
                <Mail aria-hidden="true" className="size-4 shrink-0" /><span>{resumeData.contact.email}</span>
              </a>
              <a href={resumeData.contact.phoneHref} className="resume-hero-contact inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-semibold">
                <Phone aria-hidden="true" className="size-4 shrink-0" /><span>{resumeData.contact.phone}</span>
              </a>
              <ExternalAnchor href={siteConfig.links.linkedin} aria-label="LinkedIn" title="LinkedIn" className="resume-hero-social inline-flex size-11 items-center justify-center rounded-full border">
                <LinkedInIcon aria-hidden="true" className="size-5" />
              </ExternalAnchor>
              <ExternalAnchor href={siteConfig.links.github} aria-label="GitHub" title="GitHub" className="resume-hero-social inline-flex size-11 items-center justify-center rounded-full border">
                <GitHubIcon aria-hidden="true" className="size-5" />
              </ExternalAnchor>
            </div>
          </div>
        </Container>
      </header>

      <Container className="resume-interactive-only relative z-10 -mt-6">
        <section aria-labelledby="selected-impact-heading" className="overflow-hidden rounded-[1.75rem] border border-border bg-surface shadow-[0_28px_70px_-52px_var(--foreground)]">
          <div className="flex flex-col gap-5 border-b border-border px-6 py-5 sm:px-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="eyebrow">Recruiter overview</p>
              <h2 id="selected-impact-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em]">Selected impact</h2>
            </div>
            <nav aria-label="Résumé sections" className="flex flex-wrap gap-2">
              <a href="#professional-experience" className="inline-flex min-h-11 items-center rounded-full bg-muted px-4 text-sm font-semibold text-muted-foreground hover:text-foreground">Experience</a>
              <a href="#education-heading" className="inline-flex min-h-11 items-center rounded-full bg-muted px-4 text-sm font-semibold text-muted-foreground hover:text-foreground">Education</a>
              <a href="#projects-heading" className="inline-flex min-h-11 items-center rounded-full bg-muted px-4 text-sm font-semibold text-muted-foreground hover:text-foreground">Projects</a>
              <a href="#skills-heading" className="inline-flex min-h-11 items-center rounded-full bg-muted px-4 text-sm font-semibold text-muted-foreground hover:text-foreground">Skills</a>
            </nav>
          </div>
          <div className="grid divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
            <article className="p-6 sm:p-8">
              <p className="text-4xl font-semibold tracking-[-0.06em] text-link">91%</p>
              <h3 className="mt-3 font-semibold">Fewer assembly fragments</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">With 99.9% genome fraction and 99.9% sequence identity.</p>
            </article>
            <article className="p-6 sm:p-8">
              <p className="text-4xl font-semibold tracking-[-0.06em] text-link">1,000 h</p>
              <h3 className="mt-3 font-semibold">Automated HTOL validation</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Built to collect performance and reliability data across 48 RF amplifier modules.</p>
            </article>
            <article className="p-6 sm:p-8">
              <p className="text-4xl font-semibold tracking-[-0.06em] text-link">3 labs</p>
              <h3 className="mt-3 font-semibold">Active UC Riverside research</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">Across computer architecture, secure systems, and computational genomics.</p>
            </article>
          </div>
        </section>
      </Container>

      <Container>
        <section aria-labelledby="education-heading" className="py-20 sm:py-24">
          <div className="flex items-center gap-3">
            <GraduationCap aria-hidden="true" className="size-5 text-link" />
            <p className="eyebrow">Academic path</p>
          </div>
          <h2 id="education-heading" className="resume-section-heading mt-4">Education</h2>
          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            {resumeData.education.map((education, index) => (
              <article key={education.degree} className="resume-support-card relative overflow-hidden rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm sm:p-8">
                <span aria-hidden="true" className="resume-card-index absolute right-6 top-5 font-mono text-5xl font-semibold text-subtle sm:text-6xl">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-link">{education.planned ? "Planned" : "Current"}</p>
                <h3 className="mt-8 max-w-md text-2xl font-semibold tracking-[-0.035em]">{education.school}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{education.degree}{education.planned ? " · Planned" : ""}</p>
                <p className="mt-8 border-t border-border pt-5 text-sm font-semibold">{education.dates}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="border-t border-border">
          <ResumeTimeline entries={resumeData.experience} />
        </div>

        <section aria-labelledby="projects-heading" className="border-t border-border py-20 sm:py-24">
          <p className="eyebrow">Connected work</p>
          <h2 id="projects-heading" className="resume-section-heading mt-4 max-w-4xl">Selected projects</h2>

          <div className="mt-12 grid gap-6 xl:grid-cols-2">
            {resumeData.projects.map((project) => (
              <article key={project.id} className="resume-support-card flex flex-col rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {project.technologies.map((technology) => <Badge key={technology}>{technology}</Badge>)}
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">{project.dates}</p>
                </div>
                <h3 className="mt-7 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">{project.title}</h3>
                <p className="mt-3 text-sm font-medium leading-6 text-muted-foreground">{project.organization} · {project.role}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground"><MapPin aria-hidden="true" className="size-3.5" />{project.location}</p>
                <ul className="mt-7 grid gap-4 text-sm leading-6 text-muted-foreground">
                  {project.highlights.map((highlight) => (
                    <li key={highlight} className="grid grid-cols-[0.5rem_1fr] gap-3">
                      <span aria-hidden="true" className="mt-[0.6rem] size-1.5 rounded-full bg-link" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <div className="resume-interactive-only mt-auto flex flex-wrap items-center justify-between gap-4 border-t border-border pt-7">
                  <ExperienceAnchor id={project.experienceId} />
                  <Link href={project.relatedWork.href} transitionTypes={["nav-forward"]} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link hover:underline">
                    {project.relatedWork.label}<ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="skills-heading" className="border-t border-border py-20 sm:py-24">
          <p className="eyebrow">Capability matrix</p>
          <h2 id="skills-heading" className="resume-section-heading mt-4">Skills</h2>

          <div className="mt-12 divide-y divide-border border-y border-border">
            {resumeData.skills.map((group) => (
              <div key={group.category} className="grid gap-5 py-7 lg:grid-cols-[13rem_minmax(0,1fr)_18rem] lg:items-start lg:gap-8">
                <h3 className="font-semibold">{group.category}</h3>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li key={item} className="rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground">{item}</li>
                  ))}
                </ul>
                <div className="resume-interactive-only">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-subtle">Applied in</p>
                  {group.evidence.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {group.evidence.map((experienceId) => <ExperienceAnchor key={experienceId} id={experienceId} />)}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">Broader toolkit</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="presentation-heading" className="border-t border-border py-20 sm:py-24">
          <article className="resume-presentation relative overflow-hidden rounded-[2rem] bg-primary p-7 text-primary-foreground sm:p-10 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10">
            <div className="grid size-14 place-items-center rounded-2xl border border-primary-foreground/20 bg-primary-foreground/10">
              <Mic2 aria-hidden="true" className="size-6" />
            </div>
            <div className="mt-7 lg:mt-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/90">Selected presentation</p>
              <h2 id="presentation-heading" className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{resumeData.presentation.title}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-primary-foreground/90">
                {resumeData.presentation.role} · {resumeData.presentation.event} · {resumeData.presentation.location}
              </p>
            </div>
            <p className="mt-7 inline-flex rounded-full border border-primary-foreground/20 px-4 py-2 text-sm font-semibold lg:mt-0">{resumeData.presentation.date}</p>
          </article>
        </section>
      </Container>
      </article>
  );
}
