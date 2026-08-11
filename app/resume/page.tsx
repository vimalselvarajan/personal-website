import type { Metadata } from "next";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { absoluteUrl, siteConfig } from "@/config/site";
import { resumeData } from "@/lib/resume-data";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Résumé for Vimal Selvarajan, a UC Riverside computer science student and undergraduate researcher.",
  alternates: { canonical: absoluteUrl("/resume") },
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="border-b border-border pb-3 text-xs font-bold uppercase tracking-[0.15em] text-link">{children}</h2>;
}

function TimelineHeader({
  title,
  subtitle,
  location,
  dates,
}: {
  title: string;
  subtitle: string;
  location: string;
  dates: string;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-[1fr_auto] sm:gap-x-6">
      <div>
        <h3 className="text-lg font-semibold tracking-[-0.025em]">{title}</h3>
        <p className="mt-1 text-sm font-medium text-muted-foreground">{subtitle}</p>
      </div>
      <div className="text-sm text-muted-foreground sm:text-right">
        <p className="font-medium text-foreground">{dates}</p>
        <p className="mt-1">{location}</p>
      </div>
    </div>
  );
}

export default function ResumePage() {
  return (
    <article className="resume-page mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
      <header className="border-b border-border pb-10">
        <p className="eyebrow">Résumé</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">{siteConfig.name}</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted-foreground">Computer science student and undergraduate researcher working across computer architecture, secure systems, computational genomics, and hardware-control software.</p>
        <div className="mt-7 flex flex-wrap gap-x-5 gap-y-3 text-sm">
          <a href={resumeData.contact.emailHref} className="inline-flex items-center gap-2 font-medium text-link hover:underline"><Mail aria-hidden="true" className="size-4" />{resumeData.contact.email}</a>
          <a href={resumeData.contact.phoneHref} className="inline-flex items-center gap-2 font-medium text-link hover:underline"><Phone aria-hidden="true" className="size-4" />{resumeData.contact.phone}</a>
          <a href={siteConfig.links.linkedin} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-link hover:underline">LinkedIn <ArrowUpRight aria-hidden="true" className="size-3.5" /></a>
          <a href={siteConfig.links.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 font-medium text-link hover:underline">GitHub <ArrowUpRight aria-hidden="true" className="size-3.5" /></a>
        </div>
      </header>

      <div className="mt-12 space-y-14">
        <section aria-labelledby="education-heading">
          <SectionTitle><span id="education-heading">Education</span></SectionTitle>
          <div className="mt-7 space-y-7">
            {resumeData.education.map((education) => (
              <div key={education.degree} className="grid gap-2 sm:grid-cols-[1fr_auto] sm:gap-x-6">
                <div>
                  <h3 className="text-lg font-semibold">{education.school}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{education.degree}{education.planned ? " · Planned" : ""}</p>
                </div>
                <p className="text-sm font-medium sm:text-right">{education.dates}</p>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="experience-heading">
          <SectionTitle><span id="experience-heading">Professional experience</span></SectionTitle>
          <div className="mt-8 space-y-10">
            {resumeData.experience.map((experience) => (
              <div key={experience.organization}>
                <TimelineHeader title={experience.organization} subtitle={experience.role} location={experience.location} dates={experience.dates} />
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground marker:text-link">
                  {experience.highlights.map((highlight) => <li key={highlight} className="pl-1">{highlight}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="projects-heading">
          <SectionTitle><span id="projects-heading">Projects & outside experience</span></SectionTitle>
          <div className="mt-8 space-y-10">
            {resumeData.projects.map((project) => (
              <div key={project.title}>
                <TimelineHeader title={project.title} subtitle={project.organization} location={project.location} dates={project.dates} />
                <p className="mt-2 text-sm font-medium text-muted-foreground">{project.role}</p>
                <ul className="mt-4 list-disc space-y-2 pl-5 text-sm leading-6 text-muted-foreground marker:text-link">
                  {project.highlights.map((highlight) => <li key={highlight} className="pl-1">{highlight}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </section>

        <section aria-labelledby="skills-heading">
          <SectionTitle><span id="skills-heading">Skills</span></SectionTitle>
          <dl className="mt-7 divide-y divide-border border-y border-border">
            {resumeData.skills.map((group) => (
              <div key={group.category} className="grid gap-2 py-4 sm:grid-cols-[12rem_1fr]">
                <dt className="text-sm font-semibold">{group.category}</dt>
                <dd className="text-sm leading-6 text-muted-foreground">{group.items.join(" · ")}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="presentations-heading">
          <SectionTitle><span id="presentations-heading">Selected presentation</span></SectionTitle>
          <div className="mt-7 grid gap-2 sm:grid-cols-[1fr_auto] sm:gap-x-6">
            <div>
              <h3 className="text-lg font-semibold">{resumeData.presentation.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{resumeData.presentation.role} · {resumeData.presentation.event} · {resumeData.presentation.location}</p>
            </div>
            <p className="text-sm font-medium sm:text-right">{resumeData.presentation.date}</p>
          </div>
        </section>
      </div>
    </article>
  );
}
