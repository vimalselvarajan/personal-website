import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/container";
import { ExternalAnchor } from "@/components/external-link";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer id="site-footer" className="border-t border-border bg-surface print:hidden">
      <Container className="grid gap-10 py-12 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="text-lg font-semibold tracking-[-0.02em]">{siteConfig.name}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {siteConfig.role} · Computer architecture, secure systems, computational genomics, and hardware-control software.
          </p>
        </div>
        <div className="grid gap-4 text-sm md:justify-items-end">
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
            {siteConfig.footerNav.map((item) => item.external ? (
              <ExternalAnchor key={item.href} href={item.href} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
                {item.label}<ArrowUpRight aria-hidden="true" className="size-3.5" />
              </ExternalAnchor>
            ) : (
              <Link key={item.href} href={item.href} className="text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <ExternalAnchor href={siteConfig.links.github} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              GitHub <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </ExternalAnchor>
            <ExternalAnchor href={siteConfig.links.linkedin} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
              LinkedIn <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </ExternalAnchor>
          </div>
          <p className="text-xs text-subtle">© {new Date().getFullYear()} {siteConfig.name}.</p>
        </div>
      </Container>
    </footer>
  );
}
