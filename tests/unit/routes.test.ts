import path from "node:path";
import { describe, expect, it } from "vitest";
import publicRoutes from "@/config/public-routes.json";
import { siteConfig } from "@/config/site";
import { createContentRepository } from "@/lib/content-repository";
import { resumeData } from "@/lib/resume-data";
import { assertKnownInternalHref, contentRoute, staticSiteRoutes } from "@/lib/routes";

function realRouteSet() {
  const repository = createContentRepository({ contentRoot: path.join(process.cwd(), "content"), publicRoot: path.join(process.cwd(), "public") });
  return new Set<string>([
    ...staticSiteRoutes,
    ...repository.staticParams("projects").map(({ slug }) => contentRoute("projects", slug)),
    ...repository.staticParams("research").map(({ slug }) => contentRoute("research", slug)),
  ]);
}

describe("route referential integrity", () => {
  it("keeps the standalone public-route manifest identical to generated routes", () => {
    expect(new Set(publicRoutes).size).toBe(publicRoutes.length);
    expect([...publicRoutes].sort()).toEqual([...realRouteSet()].sort());
  });

  it("resolves navigation and available related-work links", () => {
    const routes = realRouteSet();
    for (const item of [...siteConfig.nav, ...siteConfig.footerNav].filter((item) => !item.external)) expect(() => assertKnownInternalHref(item.href, "/", routes)).not.toThrow();
    expect(() => assertKnownInternalHref(siteConfig.links.resume, "/", routes)).not.toThrow();
    for (const experience of resumeData.experience) if (experience.relatedWork) expect(() => assertKnownInternalHref(experience.relatedWork.href, "/resume", routes)).not.toThrow();
  });

  it("rejects removed and unknown internal routes", () => {
    expect(() => assertKnownInternalHref("/projects/missing", "/", realRouteSet())).toThrow(/does not match a generated route/);
  });

  it("resolves safe relative Markdown links against the current content route", () => {
    expect(assertKnownInternalHref("../two", "/research/one", new Set<string>(["/research/one", "/research/two"]))).toBe("/research/two");
  });

  it.each(["//example.com", "/about%0a", "/about%2F"])("rejects adversarial internal destination %s", (href) => {
    expect(() => assertKnownInternalHref(href, "/", realRouteSet())).toThrow();
  });
});
