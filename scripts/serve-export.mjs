import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createGzip } from "node:zlib";

const root = path.resolve(process.cwd(), "out");
const basePath = process.env.PORTFOLIO_BASE_PATH ?? "/Personal-Website";
const port = Number(process.env.PORT ?? 3000);
const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".xml": "application/xml; charset=utf-8",
};

function resolveRequest(pathname) {
  if (!pathname.startsWith(`${basePath}/`) && pathname !== basePath) return null;
  const relative = decodeURIComponent(pathname.slice(basePath.length)).replace(/^\/+/, "");
  const candidates = relative === ""
    ? ["index.html"]
    : relative.endsWith("/")
      ? [path.join(relative, "index.html")]
      : [relative, path.join(relative, "index.html")];

  for (const candidate of candidates) {
    const resolved = path.resolve(root, candidate);
    if (!resolved.startsWith(`${root}${path.sep}`) && resolved !== root) continue;
    if (fs.existsSync(resolved) && fs.statSync(resolved).isFile()) return resolved;
  }
  return null;
}

const server = http.createServer((request, response) => {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { Allow: "GET, HEAD" }).end();
    return;
  }

  let pathname;
  try {
    pathname = new URL(request.url ?? "/", `http://${request.headers.host ?? "127.0.0.1"}`).pathname;
  } catch {
    response.writeHead(400).end();
    return;
  }

  const requestedFile = resolveRequest(pathname);
  const file = requestedFile ?? path.join(root, "404.html");
  const status = requestedFile ? 200 : 404;
  const extension = path.extname(file);
  const immutable = pathname.includes("/_next/static/");
  const compressible = new Set([".css", ".html", ".js", ".json", ".svg", ".txt", ".xml"]);
  const useGzip = compressible.has(extension) && /\bgzip\b/.test(request.headers["accept-encoding"] ?? "");
  response.writeHead(status, {
    "Content-Type": contentTypes[extension] ?? "application/octet-stream",
    "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
    "X-Content-Type-Options": "nosniff",
    ...(useGzip ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}),
  });
  if (request.method === "HEAD") response.end();
  else if (useGzip) fs.createReadStream(file).pipe(createGzip()).pipe(response);
  else fs.createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Static export: http://127.0.0.1:${port}${basePath}/`);
});
