import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FlaskConical, MapPin } from "lucide-react";
import { ResumeTimelineController } from "@/components/resume-timeline-controller";
import { Badge } from "@/components/ui/badge";
import type { ExperienceEntry } from "@/lib/resume-data";

type ResumeTimelineProps = {
  entries: readonly ExperienceEntry[];
};

export function ResumeTimeline({ entries }: ResumeTimelineProps) {
  const initialEntry = entries[0];
  if (!initialEntry) return null;

  return (
    <section
      id="professional-experience"
      aria-labelledby="professional-experience-heading"
      className="scroll-mt-24 py-10 sm:py-12 lg:py-14"
      data-resume-timeline
    >
      <ResumeTimelineController entries={entries.map(({ id, shortLabel }) => ({ id, shortLabel }))} />

      <div className="max-w-3xl">
        <h2 id="professional-experience-heading" className="text-3xl font-semibold tracking-[-0.05em] sm:text-4xl">
          Professional experience
        </h2>
      </div>

      <div className="mt-8 sm:mt-10 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14 xl:gap-20">
        <aside className="resume-timeline-index relative hidden lg:block print:hidden">
          <nav aria-label="Career timeline" className="resume-timeline-index-panel sticky top-28 rounded-[1.5rem] border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-subtle">Trajectory</p>
            <div data-timeline-index className="resume-timeline-index-track relative mt-6">
              <span data-timeline-index-selection aria-hidden="true" className="resume-timeline-index-selection" />
              <ol className="space-y-1">
                {entries.map((entry, index) => (
                  <li key={entry.id} data-timeline-index-entry={entry.id} className="resume-timeline-index-entry relative">
                    <a
                      href={`#experience-${entry.id}`}
                      aria-current={index === 0 ? "location" : undefined}
                      className="resume-timeline-index-link block min-h-16 rounded-xl px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span>
                        <span className="block text-sm font-semibold">{entry.shortLabel}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{entry.dates}</span>
                      </span>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </nav>
        </aside>

        <div className="min-w-0">
          <div
            aria-hidden="true"
            data-timeline-status
            data-active-timeline-label={initialEntry.id}
            className="resume-timeline-status sticky top-16 z-20 -mx-5 mb-6 px-5 sm:-mx-8 sm:px-8 lg:hidden print:hidden"
          >
            <div className="resume-timeline-status-capsule mx-auto flex max-w-2xl items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-link">
                <span className="resume-timeline-status-dot size-2 rounded-full" />
                Now viewing
              </span>
              <span data-timeline-status-name className="resume-timeline-status-name truncate text-sm font-semibold motion-reduce:animate-none">
                {initialEntry.shortLabel}
              </span>
            </div>
          </div>

          <ol className="resume-timeline-list relative space-y-8 before:absolute before:bottom-0 before:left-[0.4375rem] before:top-0 before:w-px lg:space-y-12 lg:before:hidden">
            {entries.map((entry, index) => {
              const isInitialEntry = index === 0;
              const Icon = entry.kind === "research" ? FlaskConical : BriefcaseBusiness;

              return (
                <li
                  key={entry.id}
                  id={`experience-${entry.id}`}
                  data-experience-id={entry.id}
                  data-active={isInitialEntry}
                  data-reached={isInitialEntry}
                  className="resume-timeline-entry relative scroll-mt-32 pl-8 lg:pl-0"
                >
                  <span
                    aria-hidden="true"
                    data-timeline-marker
                    className="resume-timeline-marker absolute left-0 top-8 z-10 size-4 rounded-full border-2 border-border bg-background transition-colors motion-reduce:transition-none lg:hidden"
                  />
                  <article
                    aria-labelledby={`experience-${entry.id}-heading`}
                    data-timeline-card
                    className="resume-timeline-card rounded-[1.75rem] border border-border bg-surface p-6 shadow-sm transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none sm:p-8"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap gap-2">
                        {entry.domains.map((domain) => <Badge key={domain}>{domain}</Badge>)}
                      </div>
                      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-subtle">
                        <Icon aria-hidden="true" className="size-4 text-link" />
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <div className="mt-6 grid gap-5 sm:grid-cols-[1fr_auto] sm:gap-x-8">
                      <div>
                        <h3 id={`experience-${entry.id}-heading`} className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
                          {entry.organization}
                        </h3>
                        <p className="mt-2 text-sm font-medium leading-6 text-muted-foreground">{entry.role}</p>
                      </div>
                      <div className="text-sm sm:text-right">
                        <p className="font-semibold text-foreground">{entry.dates}</p>
                        <p className="mt-2 inline-flex items-center gap-1.5 text-muted-foreground sm:justify-end">
                          <MapPin aria-hidden="true" className="size-3.5" />{entry.location}
                        </p>
                      </div>
                    </div>

                    <ul className="mt-7 grid gap-4 text-sm leading-6 text-muted-foreground">
                      {entry.highlights.map((highlight) => (
                        <li key={highlight} className="grid grid-cols-[0.5rem_1fr] gap-3">
                          <span aria-hidden="true" className="mt-[0.6rem] size-1.5 rounded-full bg-link" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="resume-interactive-only mt-7 border-t border-border pt-6">
                      <div className="flex flex-wrap gap-2">
                        {entry.technologies.map((technology) => (
                          <span key={technology} className="rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground">
                            {technology}
                          </span>
                        ))}
                      </div>
                      {entry.relatedWork ? (
                        <Link href={entry.relatedWork.href} transitionTypes={["nav-forward"]} className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-link hover:underline">
                          {entry.relatedWork.label}<ArrowRight aria-hidden="true" className="size-4" />
                        </Link>
                      ) : null}
                    </div>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
