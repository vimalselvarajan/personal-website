import Link from "next/link";
import { Container } from "@/components/container";
import { ExternalAnchor } from "@/components/external-link";
import { siteConfig } from "@/config/site";

const footerLinkClass = "site-footer-link";

export function SiteFooter() {
  return (
    <footer id="site-footer" className="site-footer print:hidden">
      <Container className="site-footer-inner max-w-5xl">
        <div className="site-footer-content">
          <div className="site-footer-identity">
            <p className="site-footer-name">{siteConfig.name}</p>
            <p className="site-footer-role">{siteConfig.role}</p>
          </div>
          <nav aria-label="Footer" className="site-footer-group">
            <p className="site-footer-heading">Explore</p>
            <ul className="site-footer-list">
              {siteConfig.footerNav.map((item) => (
                <li key={item.href}>
                  {item.external ? (
                    <ExternalAnchor href={item.href} className={footerLinkClass}>
                      {item.label}
                    </ExternalAnchor>
                  ) : (
                    <Link href={item.href} transitionTypes={["nav-root"]} className={footerLinkClass}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Contact and social links" className="site-footer-group">
            <p className="site-footer-heading">Connect</p>
            <ul className="site-footer-list">
              <li>
                <a href={siteConfig.links.email} className={footerLinkClass}>Email</a>
              </li>
              <li>
                <ExternalAnchor href={siteConfig.links.github} className={footerLinkClass}>
                  GitHub
                </ExternalAnchor>
              </li>
              <li>
                <ExternalAnchor href={siteConfig.links.linkedin} className={footerLinkClass}>
                  LinkedIn
                </ExternalAnchor>
              </li>
            </ul>
          </nav>
        </div>
        <div className="site-footer-legal">
          <p>Copyright © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.</p>
        </div>
      </Container>
    </footer>
  );
}
