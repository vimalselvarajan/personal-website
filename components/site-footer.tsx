import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/container";
import { ExternalAnchor } from "@/components/external-link";
import { siteConfig } from "@/config/site";

const footerLinkClass = "inline-flex min-h-11 items-center gap-1 text-muted-foreground transition-colors hover:text-foreground";

export function SiteFooter() {
  return (
    <footer id="site-footer" className="archive-footer print:hidden">
      <Container className="archive-footer-inner">
        <div>
          <p className="archive-footer-name">{siteConfig.name}</p>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            {siteConfig.role} · Computer architecture, secure systems, computational genomics, and hardware-control software.
          </p>
        </div>
        <div className="archive-footer-links">
          <nav aria-label="Footer" className="hidden flex-wrap gap-x-5 lg:flex">
            {siteConfig.footerNav.map((item) => item.external ? (
              <ExternalAnchor key={item.href} href={item.href} className={footerLinkClass}>
                {item.label}<ArrowUpRight aria-hidden="true" className="size-3.5" />
              </ExternalAnchor>
            ) : (
              <Link key={item.href} href={item.href} transitionTypes={["nav-root"]} className={footerLinkClass}>
                {item.label}
              </Link>
            ))}
          </nav>
          <nav aria-label="Contact and social links" className="flex flex-wrap gap-x-5">
            <Link href="/about" transitionTypes={["nav-root"]} className={footerLinkClass + " lg:hidden"}>About</Link>
            <a href={siteConfig.links.email} className={footerLinkClass}>Email</a>
            <ExternalAnchor href={siteConfig.links.github} className={footerLinkClass}>
              GitHub <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </ExternalAnchor>
            <ExternalAnchor href={siteConfig.links.linkedin} className={footerLinkClass}>
              LinkedIn <ArrowUpRight aria-hidden="true" className="size-3.5" />
            </ExternalAnchor>
          </nav>
          <p className="text-xs text-subtle">© {new Date().getFullYear()} {siteConfig.name}.</p>
        </div>
      </Container>
    </footer>
  );
}
