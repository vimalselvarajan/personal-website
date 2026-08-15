import "server-only";
import { siteConfig } from "@/config/site";
import { contentRepository } from "@/lib/content";
import { classifyHref } from "@/lib/links";
import { resumeData } from "@/lib/resume-data";
import { assertKnownInternalHref, contentRoute, staticSiteRoutes, type PortfolioRoute } from "@/lib/routes";

export function getSiteRoutes(): readonly PortfolioRoute[] {
  return [
    ...staticSiteRoutes,
    ...contentRepository.staticParams("projects").map(({ slug }) => contentRoute("projects", slug)),
    ...contentRepository.staticParams("research").map(({ slug }) => contentRoute("research", slug)),
  ];
}

function assertHrefKind(href: string, expected: ReturnType<typeof classifyHref>, label: string) {
  const actual = classifyHref(href);
  if (actual !== expected) {
    throw new Error(`${label} must be a safe ${expected} link; received "${href}" (${actual})`);
  }
}

export function validateSiteRouteReferences() {
  const routes = getSiteRoutes();
  const knownRoutes = new Set<string>(routes);

  const navigationItems = [...siteConfig.nav, ...siteConfig.footerNav];
  for (const item of navigationItems) {
    if (item.external) {
      assertHrefKind(item.href, "external", `Navigation item "${item.label}"`);
    } else {
      assertKnownInternalHref(item.href, "/", knownRoutes);
    }
  }

  assertKnownInternalHref(siteConfig.links.resume, "/", knownRoutes);
  assertHrefKind(siteConfig.links.github, "external", "GitHub profile");
  assertHrefKind(siteConfig.links.linkedin, "external", "LinkedIn profile");
  assertHrefKind(siteConfig.links.site, "external", "Production site");
  assertHrefKind(siteConfig.links.email, "same-tab", "Email address");
  assertHrefKind(resumeData.contact.emailHref, "same-tab", "Resume email address");
  assertHrefKind(resumeData.contact.phoneHref, "same-tab", "Resume phone number");

  for (const entry of resumeData.experience) {
    if (entry.relatedWork) assertKnownInternalHref(entry.relatedWork.href, "/resume", knownRoutes);
  }

  return routes;
}