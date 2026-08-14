import { expect, type APIRequestContext } from "@playwright/test";
import publicRoutes from "../../config/public-routes.json" with { type: "json" };
import { portfolioUrl, productionBasePath } from "../../config/site";

const expectedOrigin = new URL(portfolioUrl).origin;

function normalizeSitemapLocation(location: string) {
  const url = new URL(location);
  expect(url.origin, `${location} sitemap origin`).toBe(expectedOrigin);
  expect(url.search, `${location} sitemap query`).toBe("");
  expect(url.hash, `${location} sitemap fragment`).toBe("");
  expect(
    url.pathname.startsWith(`${productionBasePath}/`),
    `${location} sitemap base path`,
  ).toBe(true);

  const pathWithoutBase = url.pathname.slice(productionBasePath.length);
  const route = pathWithoutBase === "/"
    ? "/"
    : `/${pathWithoutBase.replace(/^\/+|\/+$/g, "")}`;
  const expectedPathname = route === "/"
    ? `${productionBasePath}/`
    : `${productionBasePath}${route}/`;
  expect(url.pathname, `${location} canonical sitemap pathname`).toBe(expectedPathname);

  return { pathname: url.pathname, route };
}

export async function getSitemapPaths(request: APIRequestContext) {
  const response = await request.get("./sitemap.xml");
  expect(response.status()).toBe(200);
  const xml = await response.text();
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  expect(matches.length, "sitemap route count").toBeGreaterThan(0);
  expect(publicRoutes, "committed public route manifest").toHaveLength(12);

  const locations = matches.map((match) => {
    const location = match[1];
    if (!location) throw new Error("Sitemap contains an empty <loc> element.");
    return normalizeSitemapLocation(location);
  });
  const sitemapRoutes = locations.map(({ route }) => route);
  const duplicateRoutes = sitemapRoutes.filter(
    (route, index) => sitemapRoutes.indexOf(route) !== index,
  );
  expect(duplicateRoutes, "duplicate sitemap routes").toEqual([]);
  expect([...new Set(sitemapRoutes)].sort(), "sitemap route manifest drift")
    .toEqual([...publicRoutes].sort());

  return locations.map(({ pathname }) => pathname);
}
