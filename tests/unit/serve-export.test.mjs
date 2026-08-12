import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { afterEach, describe, expect, it } from "vitest";
import { createExportServer, resolveExportRequest } from "../../scripts/serve-export.mjs";

const roots = [];
const servers = [];

afterEach(async () => {
  await Promise.all(servers.splice(0).map((server) => new Promise((resolve, reject) => {
    if (!server.listening) {
      resolve();
      return;
    }
    server.close((error) => error ? reject(error) : resolve());
  })));
  for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function request(port, requestPath, { method = "GET", headers = {} } = {}) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    const clientRequest = http.request({
      hostname: "127.0.0.1",
      port,
      path: requestPath,
      method,
      headers,
    }, (response) => {
      response.on("data", (chunk) => chunks.push(chunk));
      response.once("end", () => resolve({
        body: Buffer.concat(chunks),
        headers: response.headers,
        statusCode: response.statusCode,
      }));
    });
    clientRequest.once("error", reject);
    clientRequest.end();
  });
}

function createRoot({ include404 = true } = {}) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-export-test-"));
  roots.push(root);
  fs.writeFileSync(path.join(root, "index.html"), "<main><h1>Portfolio</h1></main>");
  if (include404) fs.writeFileSync(path.join(root, "404.html"), "<main><h1>Not found</h1></main>");
  fs.writeFileSync(path.join(root, "data.json"), JSON.stringify({ ok: true }));
  fs.writeFileSync(path.join(root, "asset.bin"), Buffer.from([0, 1, 2, 3]));
  fs.mkdirSync(path.join(root, "nested"));
  fs.writeFileSync(path.join(root, "nested", "index.html"), "<main><h1>Nested</h1></main>");
  fs.mkdirSync(path.join(root, "_next", "static"), { recursive: true });
  fs.writeFileSync(path.join(root, "_next", "static", "app.js"), "console.log('static');");
  return root;
}

async function startServer(options) {
  const root = createRoot(options);
  const server = createExportServer({ root, basePath: "/portfolio" });
  servers.push(server);
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Test server did not bind to a TCP port");
  return { port: address.port, root };
}

describe("static export preview", () => {
  it("resolves only files within the export root and configured base path", () => {
    const root = createRoot();
    const resolvedRoot = fs.realpathSync(root);

    expect(resolveExportRequest("/portfolio", { root, basePath: "/portfolio" }))
      .toBe(path.join(resolvedRoot, "index.html"));
    expect(resolveExportRequest("/portfolio/nested", { root, basePath: "/portfolio" }))
      .toBe(path.join(resolvedRoot, "nested", "index.html"));
    expect(resolveExportRequest("/portfolio/data.json", { root, basePath: "/portfolio" }))
      .toBe(path.join(resolvedRoot, "data.json"));
    expect(resolveExportRequest("/other/index.html", { root, basePath: "/portfolio" })).toBeNull();
    expect(resolveExportRequest("/portfolio/missing", { root, basePath: "/portfolio" })).toBeNull();
    expect(resolveExportRequest("/portfolio/../secret.txt", { root, basePath: "/portfolio" })).toBeNull();
    expect(() => resolveExportRequest("/portfolio/%00", { root, basePath: "/portfolio" })).toThrow(URIError);
    expect(() => resolveExportRequest("/portfolio/%E0%A4%A", { root, basePath: "/portfolio" })).toThrow(URIError);
  });

  it("rejects symlinks that escape the export root", () => {
    const root = createRoot();
    const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), "portfolio-export-outside-"));
    roots.push(outsideRoot);
    const secret = path.join(outsideRoot, "secret.txt");
    fs.writeFileSync(secret, "secret");
    fs.symlinkSync(secret, path.join(root, "linked-secret.txt"));

    expect(resolveExportRequest("/portfolio/linked-secret.txt", { root, basePath: "/portfolio" })).toBeNull();
  });

  it("returns 400 for malformed URL encoding without crashing", async () => {
    const { port } = await startServer();

    const malformed = await request(port, "/portfolio/%E0%A4%A");
    expect(malformed.statusCode).toBe(400);
    expect(malformed.headers["cache-control"]).toBe("no-store");
    expect(malformed.headers["x-content-type-options"]).toBe("nosniff");
    expect(malformed.body.toString()).toBe("Bad Request");
    expect((await request(port, "/portfolio/")).statusCode).toBe(200);
  });

  it("does not serve paths outside the configured base path", async () => {
    const { port } = await startServer();
    const response = await request(port, "/index.html");
    expect(response.statusCode).toBe(404);
    expect(response.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(response.body.toString()).toContain("Not found");
  });

  it("supports GET, HEAD, and gzip with safe content and cache headers", async () => {
    const { port } = await startServer();

    const page = await request(port, "/portfolio/");
    expect(page.statusCode).toBe(200);
    expect(page.headers["content-type"]).toBe("text/html; charset=utf-8");
    expect(page.headers["cache-control"]).toBe("public, max-age=0, must-revalidate");
    expect(page.headers["x-content-type-options"]).toBe("nosniff");
    expect(page.body.toString()).toContain("Portfolio");

    const head = await request(port, "/portfolio/", { method: "HEAD" });
    expect(head.statusCode).toBe(200);
    expect(head.body).toHaveLength(0);

    const compressed = await request(port, "/portfolio/data.json", {
      headers: { "Accept-Encoding": "br, gzip" },
    });
    expect(compressed.headers["content-encoding"]).toBe("gzip");
    expect(compressed.headers.vary).toBe("Accept-Encoding");
    expect(JSON.parse(gunzipSync(compressed.body).toString())).toEqual({ ok: true });

    const immutable = await request(port, "/portfolio/_next/static/app.js");
    expect(immutable.headers["cache-control"]).toBe("public, max-age=31536000, immutable");

    const binary = await request(port, "/portfolio/asset.bin");
    expect(binary.headers["content-type"]).toBe("application/octet-stream");
  });

  it("rejects unsupported methods", async () => {
    const { port } = await startServer();
    const response = await request(port, "/portfolio/", { method: "POST" });
    expect(response.statusCode).toBe(405);
    expect(response.headers.allow).toBe("GET, HEAD");
    expect(response.body.toString()).toBe("Method Not Allowed");
  });

  it("returns a plain 404 when the export has no fallback page", async () => {
    const { port } = await startServer({ include404: false });
    const response = await request(port, "/portfolio/missing");
    expect(response.statusCode).toBe(404);
    expect(response.headers["content-type"]).toBe("text/plain; charset=utf-8");
    expect(response.body.toString()).toBe("Not Found");
  });

  it("rejects a non-directory export root", () => {
    const root = createRoot();
    expect(() => createExportServer({ root: path.join(root, "index.html"), basePath: "/portfolio" }))
      .toThrow(/Static export root is not a directory/);
  });
});
