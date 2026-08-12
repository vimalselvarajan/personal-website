import type { Route } from "next";
import { isInternalHref } from "@/lib/links";
import type { ContentKind } from "@/lib/content-schema";

export const staticSiteRoutes = [
  "/",
  "/about",
  "/projects",
  "/research",
  "/resume",
] as const satisfies readonly Route[];

export type PortfolioRoutePath =
  | (typeof staticSiteRoutes)[number]
  | `/projects/${string}`
  | `/research/${string}`;

export type PortfolioRoute = Route<PortfolioRoutePath>;

export function contentRoute<K extends ContentKind, S extends string>(
  kind: K,
  slug: S,
): Route<`/${K}/${S}`> {
  return `/${kind}/${slug}` as Route<`/${K}/${S}`>;
}

export function normalizeRoutePath(pathname: string) {
  return pathname === "/" ? pathname : pathname.replace(/\/+$/, "");
}

export function assertKnownInternalHref(
  href: string,
  currentRoute: PortfolioRoute,
  knownRoutes: ReadonlySet<string>,
): PortfolioRoute {
  if (!isInternalHref(href)) throw new Error(`Unsafe internal link destination: ${href}`);

  const basePath = currentRoute === "/" ? "/" : `${normalizeRoutePath(currentRoute)}/`;
  const url = new URL(href, `https://portfolio.invalid${basePath}`);
  const decodedPath = decodeURIComponent(url.pathname);

  if (decodedPath !== url.pathname) {
    throw new Error(`Encoded internal link destinations are not supported: ${href}`);
  }

  const routePath = normalizeRoutePath(url.pathname);
  if (!knownRoutes.has(routePath)) {
    throw new Error(`Internal link does not match a generated route: ${href}`);
  }

  return `${routePath === "/" ? "/" : routePath}${url.search}${url.hash}` as PortfolioRoute;
}
