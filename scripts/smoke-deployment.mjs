import publicRoutes from "../config/public-routes.json" with { type: "json" };

const publicUrl = process.env.PORTFOLIO_PUBLIC_URL;
if (!publicUrl) throw new Error("PORTFOLIO_PUBLIC_URL is required");

const baseUrl = new URL(publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`);
const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function readPngDimensions(buffer) {
  if (buffer.length < 24 || !buffer.subarray(0, 8).equals(pngSignature)) {
    throw new Error("Social preview is not a valid PNG file");
  }
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

async function fetchWithRetry(pathname) {
  const url = new URL(pathname.replace(/^\//, ""), baseUrl);
  let lastError;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "follow" });
      if (response.ok) return response;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
  throw lastError;
}

const rootResponse = await fetchWithRetry("");
const strictTransportSecurity = rootResponse.headers.get("strict-transport-security");
const maxAgeMatch = strictTransportSecurity?.match(/\bmax-age=(\d+)\b/i);
if (!maxAgeMatch || Number(maxAgeMatch[1]) <= 0) {
  throw new Error(`${baseUrl} is missing a valid Strict-Transport-Security header`);
}
console.log(`PASS ${baseUrl} HSTS`);

const sitemap = await (await fetchWithRetry("sitemap.xml")).text();
const sitemapMatches = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)];
if (sitemapMatches.length === 0) throw new Error("Sitemap does not contain any routes");
if (publicRoutes.length !== 12) {
  throw new Error(`Public route manifest must contain 12 routes; received ${publicRoutes.length}`);
}

const basePath = baseUrl.pathname.replace(/\/+$/, "");
const sitemapLocations = sitemapMatches.map((match) => {
  const location = match[1];
  if (!location) throw new Error("Sitemap contains an empty <loc> element");
  const url = new URL(location);
  if (url.origin !== baseUrl.origin) {
    throw new Error(`${location} must use deployment origin ${baseUrl.origin}`);
  }
  if (url.search || url.hash) {
    throw new Error(`${location} must not contain a query string or fragment`);
  }
  if (!url.pathname.startsWith(`${basePath}/`)) {
    throw new Error(`${location} must stay under deployment base path ${basePath || "/"}`);
  }

  const pathWithoutBase = url.pathname.slice(basePath.length);
  const route = pathWithoutBase === "/"
    ? "/"
    : `/${pathWithoutBase.replace(/^\/+|\/+$/g, "")}`;
  const expectedPathname = route === "/" ? `${basePath}/` : `${basePath}${route}/`;
  if (url.pathname !== expectedPathname) {
    throw new Error(`${location} must use canonical trailing-slash pathname ${expectedPathname}`);
  }
  return { href: url.href, route };
});

const sitemapRoutes = sitemapLocations.map(({ route }) => route);
const duplicateRoutes = sitemapRoutes.filter(
  (route, index) => sitemapRoutes.indexOf(route) !== index,
);
if (duplicateRoutes.length > 0) {
  throw new Error(`Sitemap contains duplicate routes: ${[...new Set(duplicateRoutes)].join(", ")}`);
}
const actualRouteSet = [...new Set(sitemapRoutes)].sort();
const expectedRouteSet = [...publicRoutes].sort();
if (JSON.stringify(actualRouteSet) !== JSON.stringify(expectedRouteSet)) {
  const missing = expectedRouteSet.filter((route) => !actualRouteSet.includes(route));
  const extra = actualRouteSet.filter((route) => !expectedRouteSet.includes(route));
  throw new Error(`Sitemap route drift. Missing: ${missing.join(", ") || "none"}; extra: ${extra.join(", ") || "none"}`);
}

for (const { href } of sitemapLocations) {
  const response = await fetchWithRetry(href);
  const html = await response.text();
  if (!/<main[\s>]/.test(html) || !/<h1[\s>]/.test(html)) throw new Error(`${href} is missing semantic page content`);
  console.log(`PASS ${href}`);
}

const socialPreviewPath = "social-preview.png";
const socialImage = await fetchWithRetry(socialPreviewPath);
const socialContentType = socialImage.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
if (socialContentType !== "image/png") {
  throw new Error(`${new URL(socialPreviewPath, baseUrl)} must be served as image/png; received ${socialContentType ?? "none"}`);
}
const socialImageBytes = Buffer.from(await socialImage.arrayBuffer());
const socialDimensions = readPngDimensions(socialImageBytes);
if (socialDimensions.width !== 1200 || socialDimensions.height !== 630) {
  throw new Error(`${new URL(socialPreviewPath, baseUrl)} must be 1200x630; received ${socialDimensions.width}x${socialDimensions.height}`);
}
console.log(`PASS ${new URL(socialPreviewPath, baseUrl)} image/png 1200x630`);

const profileAssets = [384, 640, 768, 1024, 1280].flatMap((width) =>
  ["avif", "webp", "jpg"].map((format) => `profile/profile-${width}.${format}`),
);
for (const asset of [
  "robots.txt", "sitemap.xml", "icon.svg", "research/mtp-lite-genome-assembly-poster.jpg",
  ...profileAssets,
]) {
  await fetchWithRetry(asset);
  console.log(`PASS ${new URL(asset, baseUrl)}`);
}
