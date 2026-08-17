"use client";

import { useEffect } from "react";
import type { ExperienceId } from "@/lib/resume-data";

type TimelineEntry = {
  id: ExperienceId;
  shortLabel: string;
};

type ResumeTimelineControllerProps = {
  entries: readonly TimelineEntry[];
};

export function ResumeTimelineController({ entries }: ResumeTimelineControllerProps) {
  useEffect(() => {
    const timeline = document.querySelector<HTMLElement>("[data-resume-timeline]");
    const initialEntry = entries[0];
    if (!timeline || !initialEntry) return;

    const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
    const experienceElements = entries
      .map((entry) => document.getElementById(`experience-${entry.id}`))
      .filter((element): element is HTMLElement => Boolean(element));
    const indexEntries = new Map(
      Array.from(timeline.querySelectorAll<HTMLElement>("[data-timeline-index-entry]")).map((element) => [
        element.dataset.timelineIndexEntry as ExperienceId,
        element,
      ]),
    );
    const index = timeline.querySelector<HTMLElement>("[data-timeline-index]");
    const selection = timeline.querySelector<HTMLElement>("[data-timeline-index-selection]");
    const status = timeline.querySelector<HTMLElement>("[data-timeline-status]");
    const statusName = timeline.querySelector<HTMLElement>("[data-timeline-status-name]");
    let activeId = initialEntry.id;

    const updateSelection = () => {
      const activeItem = indexEntries.get(activeId);
      if (!index || !selection || !activeItem) return;

      const indexBounds = index.getBoundingClientRect();
      const itemBounds = activeItem.getBoundingClientRect();
      selection.style.height = `${itemBounds.height}px`;
      selection.style.transform = `translate3d(0, ${itemBounds.top - indexBounds.top}px, 0)`;
      selection.dataset.ready = "true";
    };

    const setActive = (id: ExperienceId) => {
      const nextEntry = entriesById.get(id);
      if (!nextEntry) return;

      activeId = id;
      const activeIndex = entries.findIndex((entry) => entry.id === id);
      experienceElements.forEach((element, index) => {
        const isActive = element.dataset.experienceId === id;
        element.dataset.active = String(isActive);
        element.dataset.reached = String(index <= activeIndex);
      });
      indexEntries.forEach((element, entryId) => {
        const link = element.querySelector<HTMLAnchorElement>("a");
        if (!link) return;
        if (entryId === id) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      if (status) status.dataset.activeTimelineLabel = id;
      if (statusName) statusName.textContent = nextEntry.shortLabel;
      updateSelection();
    };

    const observer = new IntersectionObserver(
      () => {
        const targetLine = Math.min(window.innerHeight * 0.3, 280);
        const elementAtTarget = experienceElements.find((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.top <= targetLine && bounds.bottom >= targetLine;
        });
        const closestElement = elementAtTarget ?? [...experienceElements].sort((first, second) => {
          const firstDistance = Math.abs(first.getBoundingClientRect().top - targetLine);
          const secondDistance = Math.abs(second.getBoundingClientRect().top - targetLine);
          return firstDistance - secondDistance;
        })[0];
        const id = closestElement?.dataset.experienceId as ExperienceId | undefined;
        if (id) setActive(id);
      },
      { rootMargin: "-18% 0px -58% 0px", threshold: [0, 0.15, 0.5] },
    );

    const onIndexLinkClick = (event: Event) => {
      const link = event.currentTarget as HTMLAnchorElement;
      const id = link.closest<HTMLElement>("[data-timeline-index-entry]")?.dataset.timelineIndexEntry as ExperienceId | undefined;
      if (id) setActive(id);
    };
    const indexLinks = Array.from(timeline.querySelectorAll<HTMLAnchorElement>("[data-timeline-index-entry] > a"));

    updateSelection();
    experienceElements.forEach((element) => observer.observe(element));
    indexLinks.forEach((link) => link.addEventListener("click", onIndexLinkClick));

    const resizeObserver = index && typeof ResizeObserver !== "undefined"
      ? new ResizeObserver(updateSelection)
      : undefined;
    if (index && resizeObserver) resizeObserver.observe(index);
    window.addEventListener("resize", updateSelection);

    return () => {
      observer.disconnect();
      indexLinks.forEach((link) => link.removeEventListener("click", onIndexLinkClick));
      resizeObserver?.disconnect();
      window.removeEventListener("resize", updateSelection);
    };
  }, [entries]);

  return null;
}
