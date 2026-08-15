"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { Container } from "@/components/container";
import { siteConfig } from "@/config/site";
import { MobileNavDock } from "@/components/mobile-nav-dock";
import { SiteNav } from "@/components/site-nav";
import { GlassSurface } from "@/components/ui/glass-surface";
import { cn } from "@/lib/utils";

function subscribeToHeaderElevation(onStoreChange: () => void) {
  let previousValue = window.scrollY > 8;

  const handleScroll = () => {
    const nextValue = window.scrollY > 8;
    if (nextValue === previousValue) return;
    previousValue = nextValue;
    onStoreChange();
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  return () => window.removeEventListener("scroll", handleScroll);
}

function getHeaderElevationSnapshot() {
  return window.scrollY > 8;
}

function getHeaderElevationServerSnapshot() {
  return false;
}
export function SiteHeader() {
  const isElevated = useSyncExternalStore(
    subscribeToHeaderElevation,
    getHeaderElevationSnapshot,
    getHeaderElevationServerSnapshot,
  );

  return (
    <header
      className="site-header pointer-events-none fixed inset-x-0 top-0 z-50 print:hidden"
      style={{ viewTransitionName: "site-header" }}
    >
      <Container className="pointer-events-none flex min-h-20 items-center py-3">
        <GlassSurface
          elevated={isElevated}
          material="thick"
          className={cn(
            "glass-nav pointer-events-auto relative flex min-h-14 w-full items-center gap-3 px-3 sm:px-4",
            isElevated && "glass-nav-elevated",
          )}
        >
          <Link
            href="/"
            transitionTypes={["nav-root"]}
            className="group flex min-h-11 items-center gap-3 rounded-full px-1 font-semibold tracking-[-0.025em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`${siteConfig.name}, home`}
          >
            <span className="site-mark grid size-9 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground shadow-[0_8px_20px_-12px_var(--primary)] transition-transform duration-200 group-hover:scale-[1.03] motion-reduce:transition-none" aria-hidden="true">
              {siteConfig.initials}
            </span>
            <span className="hidden sm:inline">{siteConfig.name}</span>
          </Link>
          <SiteNav items={siteConfig.nav} />
        </GlassSurface>
      </Container>
      <MobileNavDock items={siteConfig.nav} />
    </header>
  );
}
