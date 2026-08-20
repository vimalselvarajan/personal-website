import type { Metadata } from "next";
import { ArrowUpRight, Mail, Mic2, Phone } from "lucide-react";
import { LinkedInIcon } from "@/components/brand-icons";
import { Container } from "@/components/container";
import { ExternalAnchor } from "@/components/external-link";
import { ResumeTimeline } from "@/components/resume-timeline";
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
        <div className="resume-hero-orb absolute -right-20 -top-28 size-[22rem] rounded-full" aria-hidden="true" />

        <Container className="resume-hero-inner relative py-8 sm:py-10 lg:py-12">
          <div>
            <h1 className="resume-hero-title md:whitespace-nowrap">
              {siteConfig.name}
            </h1>
            <section aria-labelledby="resume-education-heading" className="resume-education mt-5 flex flex-wrap items-baseline gap-x-5 gap-y-2">
              <p id="resume-education-heading" className="text-xs font-bold uppercase tracking-[0.16em] text-[color:var(--resume-muted)]">
                Education
              </p>
              <ol className="resume-education-degrees flex max-w-5xl flex-wrap gap-x-4 gap-y-1 text-sm font-semibold leading-6 sm:text-base">
                {resumeData.education.map((education, index) => (
                  <li key={education.degree} className="flex items-baseline gap-4">
                    {index > 0 ? <span aria-hidden="true" className="text-[color:var(--resume-muted)]">·</span> : null}
                    <span>{education.degree}</span>
                  </li>
                ))}
              </ol>
            </section>
            <div className="resume-hero-actions mt-6 flex flex-wrap gap-3 text-sm">
              <a href={resumeData.contact.emailHref} className="resume-hero-contact inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-semibold">
                <Mail aria-hidden="true" className="size-4 shrink-0" /><span>{resumeData.contact.email}</span>
              </a>
              <a href={resumeData.contact.phoneHref} className="resume-hero-contact inline-flex min-h-11 items-center gap-2 rounded-full border px-4 font-semibold">
                <Phone aria-hidden="true" className="size-4 shrink-0" /><span>{resumeData.contact.phone}</span>
              </a>
              <ExternalAnchor href={siteConfig.links.linkedin} aria-label="LinkedIn" title="LinkedIn" className="resume-hero-social inline-flex size-11 items-center justify-center rounded-full border">
                <LinkedInIcon aria-hidden="true" className="size-5" />
              </ExternalAnchor>
            </div>
          </div>
        </Container>
      </header>

      <Container>
        <ResumeTimeline entries={resumeData.experience} />

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
          <article>
            <ExternalAnchor
              href={resumeData.presentation.href}
              className="resume-presentation group relative block overflow-hidden rounded-[2rem] border border-border bg-surface p-7 text-foreground shadow-[var(--surface-shadow)] transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-px hover:border-foreground/20 hover:shadow-[var(--glass-shadow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:scale-[0.995] motion-reduce:transform-none motion-reduce:transition-none sm:p-10 lg:grid lg:grid-cols-[auto_1fr_auto] lg:items-center lg:gap-10"
            >
              <div className="grid size-14 place-items-center rounded-2xl border border-border bg-muted">
                <Mic2 aria-hidden="true" className="size-6" />
              </div>
              <div className="mt-7 lg:mt-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-subtle">Selected presentation</p>
                <h2 id="presentation-heading" className="mt-4 max-w-3xl text-3xl font-semibold tracking-[-0.045em] sm:text-4xl">{resumeData.presentation.title}</h2>
                <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
                  {resumeData.presentation.role} · {resumeData.presentation.event} · {resumeData.presentation.location}
                </p>
              </div>
              <p className="mt-7 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm font-semibold text-muted-foreground lg:mt-0">
                {resumeData.presentation.date}
                <ArrowUpRight aria-hidden="true" className="size-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 motion-reduce:transition-none" />
              </p>
            </ExternalAnchor>
          </article>
        </section>
      </Container>
    </article>
  );
}
