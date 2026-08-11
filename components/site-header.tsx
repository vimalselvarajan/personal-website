import Link from "next/link";
import { Container } from "@/components/container";
import { siteConfig } from "@/config/site";
import { SiteNav } from "@/components/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-xl supports-[backdrop-filter]:bg-background/72 print:hidden">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex items-center gap-3 rounded-md font-semibold tracking-[-0.025em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`${siteConfig.name}, home`}
        >
          <span className="grid size-8 place-items-center rounded-full bg-primary text-[9px] font-bold text-primary-foreground" aria-hidden="true">
            {siteConfig.initials}
          </span>
          <span className="hidden sm:inline">{siteConfig.name}</span>
        </Link>
        <SiteNav items={siteConfig.nav} />
      </Container>
    </header>
  );
}
