"use client";

import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FlaskConical, MapPin } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ExperienceEntry, ExperienceId } from "@/lib/resume-data";

type ResumeTimelineProps = {
  entries: readonly ExperienceEntry[];
};

export function ResumeTimeline({ entries }: ResumeTimelineProps) {
  const [activeId, setActiveId] = useState<ExperienceId | undefined>(entries[0]?.id);
  const timelineIndexRef = useRef<HTMLDivElement>(null);
  const timelineSelectionRef = useRef<HTMLSpanElement>(null);
  const activeIndex = Math.max(0, entries.findIndex((entry) => entry.id === activeId));
  const activeEntry = entries[activeIndex];
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

  useLayoutEffect(() => {
    const index = timelineIndexRef.current;
    const selection = timelineSelectionRef.current;
    if (!index || !selection || !activeId) return;

    const updateSelection = () => {
      const activeItem = index.querySelector<HTMLElement>(`[data-timeline-index-entry="${activeId}"]`);
      if (!activeItem) return;

      const indexBounds = index.getBoundingClientRect();
      const itemBounds = activeItem.getBoundingClientRect();
      selection.style.height = `${itemBounds.height}px`;
      selection.style.transform = `translate3d(0, ${itemBounds.top - indexBounds.top}px, 0)`;
      selection.dataset.ready = "true";
    };

    updateSelection();

    const resizeObserver = new ResizeObserver(updateSelection);
    resizeObserver.observe(index);
    window.addEventListener("resize", updateSelection);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateSelection);
    };
  }, [activeId]);

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
          <nav aria-label="Career timeline" className="resume-timeline-index-panel sticky top-28 rounded-[1.5rem] border border-border bg-surface p-6 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.13em] text-subtle">Trajectory</p>
            <div ref={timelineIndexRef} className="resume-timeline-index-track relative mt-6">
              <span ref={timelineSelectionRef} aria-hidden="true" className="resume-timeline-index-selection" />
              <ol className="space-y-1">
                {entries.map((entry) => {
                  const isActive = entry.id === activeId;

                  return (
                    <li key={entry.id} data-timeline-index-entry={entry.id} className="resume-timeline-index-entry relative">
                      <a
                        href={`#experience-${entry.id}`}
                        aria-current={isActive ? "location" : undefined}
                        onClick={() => setActiveId(entry.id)}
                        className={cn(
                          "resume-timeline-index-link block min-h-16 rounded-xl px-3 py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
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
            className="resume-timeline-status sticky top-16 z-20 -mx-5 mb-8 px-5 sm:-mx-8 sm:px-8 lg:hidden print:hidden"
          >
            <div className="resume-timeline-status-capsule mx-auto flex max-w-2xl items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-link">
                <span className="resume-timeline-status-dot size-2 rounded-full" />
                Now viewing
              </span>
              <span key={activeEntry?.id} className="resume-timeline-status-name truncate text-sm font-semibold motion-reduce:animate-none">{activeEntry?.shortLabel}</span>
            </div>
          </div>

          <ol className="resume-timeline-list relative space-y-8 before:absolute before:bottom-0 before:left-[0.4375rem] before:top-0 before:w-px lg:space-y-12 lg:before:hidden">
            {entries.map((entry, index) => {
              const isActive = entry.id === activeId;
              const isReached = index <= activeIndex;
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
                      "resume-timeline-marker absolute left-0 top-8 z-10 size-4 rounded-full border-2 transition-colors motion-reduce:transition-none lg:hidden",
                      isReached ? "border-link bg-link/15" : "border-border bg-background",
                      isActive && "is-active bg-link",
                    )}
                  />
                  <article
                    aria-labelledby={`experience-${entry.id}-heading`}
                    className={cn(
                      "resume-timeline-card rounded-[1.75rem] border bg-surface p-6 transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none sm:p-8",
                      isActive ? "is-active border-link/45 shadow-[0_20px_60px_-40px_var(--link)]" : "border-border shadow-sm",
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
