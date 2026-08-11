const publicUrl = process.env.PORTFOLIO_PUBLIC_URL;
if (!publicUrl) throw new Error("PORTFOLIO_PUBLIC_URL is required");

const baseUrl = new URL(publicUrl.endsWith("/") ? publicUrl : `${publicUrl}/`);

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

const sitemap = await (await fetchWithRetry("sitemap.xml")).text();
const routes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
for (const route of routes) {
  const response = await fetchWithRetry(route);
  const html = await response.text();
  if (!/<main[\s>]/.test(html) || !/<h1[\s>]/.test(html)) throw new Error(`${route} is missing semantic page content`);
  console.log(`PASS ${route}`);
}

for (const asset of ["robots.txt", "sitemap.xml", "opengraph-image", "icon.svg", "projects/power_supply.png"]) {
  await fetchWithRetry(asset);
  console.log(`PASS ${new URL(asset, baseUrl)}`);
}
