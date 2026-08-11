import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, GraduationCap, Mail, MapPin, Mic2, Phone } from "lucide-react";
import { Container } from "@/components/container";
import { ResumeTimeline } from "@/components/resume-timeline";
import { Badge } from "@/components/ui/badge";
import { absoluteUrl, siteConfig } from "@/config/site";
import { resumeData, type ExperienceId } from "@/lib/resume-data";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Résumé for Vimal Selvarajan, a UC Riverside computer science student and undergraduate researcher.",
  alternates: { canonical: absoluteUrl("/resume") },
};

function ExperienceAnchor({ id }: { id: ExperienceId }) {
  const experience = resumeData.experience.find((entry) => entry.id === id);
  if (!experience) return null;

  return (
    <a href={`#experience-${experience.id}`} className="rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:border-link/40 hover:text-foreground">
      {experience.shortLabel}
    </a>
  );
}

export default function ResumePage() {
  return (
    <article className="resume-page">
      <header className="resume-hero relative overflow-hidden border-b border-primary-foreground/10 bg-primary text-primary-foreground">
        <div className="resume-signal-grid absolute inset-0" aria-hidden="true" />
        <div className="absolute -right-32 -top-32 size-[30rem] rounded-full bg-[radial-gradient(circle,color-mix(in_oklab,var(--link)_28%,transparent),transparent_68%)]" aria-hidden="true" />

        <Container className="resume-hero-inner relative py-16 sm:py-20 lg:py-24">
          <div className="max-w-5xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-foreground/60">Résumé</p>
            <h1 className="mt-5 text-balance text-[clamp(3.4rem,9vw,7.5rem)] font-semibold leading-[0.9] tracking-[-0.075em]">
              {siteConfig.name}
            </h1>
            <p className="mt-7 max-w-3xl text-lg leading-8 text-primary-foreground/70 sm:text-xl">
              Computer science student and undergraduate researcher working across computer architecture, secure systems, computational genomics, and hardware-control software.
            </p>
            <div className="mt-8 flex flex-wrap gap-3 text-sm">
              <a href={resumeData.contact.emailHref} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-foreground/20 px-4 font-semibold hover:bg-primary-foreground/10">
                <Mail aria-hidden="true" className="size-4" />{resumeData.contact.email}
              </a>
              <a href={resumeData.contact.phoneHref} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary-foreground/20 px-4 font-semibold hover:bg-primary-foreground/10">
                <Phone aria-hidden="true" className="size-4" />{resumeData.contact.phone}
              </a>
              <a href={siteConfig.links.linkedin} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-semibold text-primary-foreground/75 hover:text-primary-foreground">
                LinkedIn <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
              <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 font-semibold text-primary-foreground/75 hover:text-primary-foreground">
                GitHub <ArrowUpRight aria-hidden="true" className="size-3.5" />
              </a>
            </div>
          </div>

        </Container>
      </header>

      <Container>
        <section aria-labelledby="education-heading" className="py-20 sm:py-24">
          <div className="flex items-center gap-3">
            <GraduationCap aria-hidden="true" className="size-5 text-link" />
            <p className="eyebrow">Academic path</p>
          </div>
          <h2 id="education-heading" className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Education</h2>
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
          <h2 id="projects-heading" className="mt-4 max-w-4xl text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Projects &amp; outside experience</h2>

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
                  <Link href={project.relatedWork.href} className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link hover:underline">
                    {project.relatedWork.label}<ArrowRight aria-hidden="true" className="size-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="skills-heading" className="border-t border-border py-20 sm:py-24">
          <p className="eyebrow">Capability matrix</p>
          <h2 id="skills-heading" className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">Skills</h2>

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
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-primary-foreground/70">Selected presentation</p>
              <h2 id="presentation-heading" className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{resumeData.presentation.title}</h2>
              <p className="mt-4 max-w-3xl text-sm leading-6 text-primary-foreground/65">
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
