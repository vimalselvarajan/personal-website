import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { createGzip } from "node:zlib";
import { productionBasePath } from "../config/site.ts";

const defaultRoot = path.resolve(process.cwd(), "out");
const contentTypes = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};
const compressible = new Set([".css", ".html", ".js", ".json", ".svg", ".txt", ".webmanifest", ".xml"]);

function isWithinRoot(root, candidate) {
  return candidate === root || candidate.startsWith(`${root}${path.sep}`);
}

function resolveFileWithinRoot(root, candidate) {
  const resolved = path.resolve(root, candidate);
  if (!isWithinRoot(root, resolved) || !fs.existsSync(resolved)) return null;
  const realFile = fs.realpathSync(resolved);
  if (!isWithinRoot(root, realFile) || !fs.statSync(realFile).isFile()) return null;
  return realFile;
}

export function resolveExportRequest(pathname, { root = defaultRoot, basePath = productionBasePath } = {}) {
  if (!pathname.startsWith(`${basePath}/`) && pathname !== basePath) return null;
  let relative;
  try {
    relative = decodeURIComponent(pathname.slice(basePath.length)).replace(/^\/+/, "");
  } catch {
    throw new URIError("Malformed URL encoding");
  }
  if (relative.includes("\0")) throw new URIError("URL paths cannot contain null bytes");

  const candidates = relative === ""
    ? ["index.html"]
    : relative.endsWith("/")
      ? [path.join(relative, "index.html")]
      : [relative, path.join(relative, "index.html")];

  for (const candidate of candidates) {
    const file = resolveFileWithinRoot(root, candidate);
    if (file) return file;
  }
  return null;
}

function responseHeaders(extension, pathname, request) {
  const immutable = pathname.includes("/_next/static/");
  const useGzip = compressible.has(extension) && /\bgzip\b/.test(request.headers["accept-encoding"] ?? "");
  return {
    headers: {
      "Content-Type": contentTypes[extension] ?? "application/octet-stream",
      "Cache-Control": immutable ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
      "X-Content-Type-Options": "nosniff",
      ...(useGzip ? { "Content-Encoding": "gzip", Vary: "Accept-Encoding" } : {}),
    },
    useGzip,
  };
}

export function createExportServer({ root: requestedRoot = defaultRoot, basePath = productionBasePath } = {}) {
  const root = fs.realpathSync(requestedRoot);
  if (!fs.statSync(root).isDirectory()) throw new Error(`Static export root is not a directory: ${root}`);

  return http.createServer((request, response) => {
    if (request.method !== "GET" && request.method !== "HEAD") {
      response.writeHead(405, { Allow: "GET, HEAD", "Content-Type": contentTypes[".txt"] }).end("Method Not Allowed");
      return;
    }

    let pathname;
    let requestedFile;
    try {
      pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname;
      requestedFile = resolveExportRequest(pathname, { root, basePath });
    } catch (error) {
      const malformed = error instanceof URIError;
      if (!malformed) console.error(error);
      response.writeHead(malformed ? 400 : 500, {
        "Content-Type": contentTypes[".txt"],
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      }).end(malformed ? "Bad Request" : "Internal Server Error");
      return;
    }

    const file = requestedFile ?? resolveFileWithinRoot(root, "404.html");
    if (!file) {
      response.writeHead(404, {
        "Content-Type": contentTypes[".txt"],
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      }).end("Not Found");
      return;
    }

    const status = requestedFile ? 200 : 404;
    const extension = path.extname(file);
    const { headers, useGzip } = responseHeaders(extension, pathname, request);
    response.writeHead(status, headers);
    if (request.method === "HEAD") response.end();
    else if (useGzip) fs.createReadStream(file).pipe(createGzip()).pipe(response);
    else fs.createReadStream(file).pipe(response);
  });
}
