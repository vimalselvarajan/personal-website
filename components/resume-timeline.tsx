"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FlaskConical, MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExperienceEntry, ExperienceId } from "@/lib/resume-data";

type ResumeTimelineProps = {
  entries: readonly ExperienceEntry[];
};

export function ResumeTimeline({ entries }: ResumeTimelineProps) {
  const [activeId, setActiveId] = useState<ExperienceId | undefined>(entries[0]?.id);
  const activeIndex = Math.max(0, entries.findIndex((entry) => entry.id === activeId));
  const activeEntry = entries[activeIndex];
  const progress = entries.length > 1 ? (activeIndex / (entries.length - 1)) * 100 : 0;
  const entryIds = useMemo(() => entries.map((entry) => entry.id), [entries]);

  useEffect(() => {
    const elements = entryIds
      .map((id) => document.getElementById(`experience-${id}`))
      .filter((element): element is HTMLElement => Boolean(element));

    const observer = new IntersectionObserver(
      () => {
        const targetLine = Math.min(window.innerHeight * 0.3, 280);
        const elementAtTarget = elements.find((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.top <= targetLine && bounds.bottom >= targetLine;
        });
        const closestElement = elementAtTarget ?? [...elements].sort((first, second) => {
          const firstDistance = Math.abs(first.getBoundingClientRect().top - targetLine);
          const secondDistance = Math.abs(second.getBoundingClientRect().top - targetLine);
          return firstDistance - secondDistance;
        })[0];
        const id = closestElement?.getAttribute("data-experience-id") as ExperienceId | null;
        if (id) setActiveId(id);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.15, 0.5] },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [entryIds]);

  return (
    <section id="professional-experience" aria-labelledby="professional-experience-heading" className="scroll-mt-24 py-20 sm:py-24">
      <div className="max-w-3xl">
        <p className="eyebrow">Career timeline</p>
        <h2 id="professional-experience-heading" className="mt-4 text-4xl font-semibold tracking-[-0.05em] sm:text-5xl">
          Professional experience
        </h2>
      </div>

      <div className="mt-12 lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14 xl:gap-20">
        <aside className="resume-timeline-index relative hidden lg:block print:hidden">
          <nav aria-label="Career timeline" className="sticky top-28 rounded-[1.5rem] border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-subtle">Trajectory</p>
            <div className="relative mt-6">
              <span aria-hidden="true" className="absolute bottom-3 left-[0.4375rem] top-3 w-px bg-border" />
              <span
                aria-hidden="true"
                className="absolute left-[0.4375rem] top-3 w-px bg-link transition-[height] duration-300 motion-reduce:transition-none"
                style={{ height: `${progress}%` }}
              />
              <ol className="space-y-1">
                {entries.map((entry, index) => {
                  const isActive = entry.id === activeId;
                  const isReached = index <= activeIndex;

                  return (
                    <li key={entry.id} className="relative">
                      <a
                        href={`#experience-${entry.id}`}
                        aria-current={isActive ? "location" : undefined}
                        onClick={() => setActiveId(entry.id)}
                        className={cn(
                          "group grid min-h-16 grid-cols-[1rem_1fr] items-center gap-3 rounded-xl px-1 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <span
                          aria-hidden="true"
                          className={cn(
                            "relative z-10 size-4 rounded-full border-2 bg-surface transition-colors motion-reduce:transition-none",
                            isReached ? "border-link" : "border-border group-hover:border-subtle",
                            isActive && "bg-link shadow-[0_0_0_4px_var(--muted)]",
                          )}
                        />
                        <span>
                          <span className="block text-sm font-semibold">{entry.shortLabel}</span>
                          <span className="mt-0.5 block text-xs text-muted-foreground">{entry.dates}</span>
                        </span>
                      </a>
                    </li>
                  );
                })}
              </ol>
            </div>
          </nav>
        </aside>

        <div className="min-w-0">
          <div
            aria-hidden="true"
            data-active-timeline-label={activeEntry?.id}
            className="resume-timeline-status sticky top-16 z-20 -mx-5 mb-8 border-y border-border bg-background/90 px-5 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 lg:hidden print:hidden"
          >
            <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-link">Now viewing</span>
              <span className="truncate text-sm font-semibold">{activeEntry?.shortLabel}</span>
            </div>
          </div>

          <ol className="resume-timeline-list relative space-y-8 before:absolute before:bottom-0 before:left-[0.4375rem] before:top-0 before:w-px before:bg-border lg:space-y-12 lg:before:hidden">
            {entries.map((entry, index) => {
              const isActive = entry.id === activeId;
              const Icon = entry.kind === "research" ? FlaskConical : BriefcaseBusiness;

              return (
                <li
                  key={entry.id}
                  id={`experience-${entry.id}`}
                  data-experience-id={entry.id}
                  className="resume-timeline-entry relative scroll-mt-32 pl-8 lg:pl-0"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "resume-timeline-marker absolute left-0 top-8 z-10 size-4 rounded-full border-2 bg-background transition-colors motion-reduce:transition-none lg:hidden",
                      isActive ? "border-link bg-link shadow-[0_0_0_4px_var(--muted)]" : "border-border",
                    )}
                  />
                  <article
                    aria-labelledby={`experience-${entry.id}-heading`}
                    className={cn(
                      "resume-timeline-card rounded-[1.75rem] border bg-surface p-6 transition-[border-color,box-shadow,transform] duration-300 motion-reduce:transition-none sm:p-8",
                      isActive ? "border-link/45 shadow-[0_20px_60px_-40px_var(--link)] lg:-translate-y-1" : "border-border shadow-sm",
                    )}
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
