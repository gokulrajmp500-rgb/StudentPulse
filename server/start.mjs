import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "./env.mjs";
process.env.NODE_ENV = "production";
const { createApiMiddleware } = await import("./api.mjs");
const { db } = await import("./db.mjs");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../dist");
const indexFile = path.join(root, "index.html");
const port = Number(process.env.PORT ?? 4173);
const host = process.env.HOST ?? "0.0.0.0";
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".txt", "text/plain; charset=utf-8"],
  [".webp", "image/webp"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
]);

async function serveStatic(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") {
    res.writeHead(405, { allow: "GET, HEAD" });
    return res.end();
  }
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(req.url ?? "/", `http://${req.headers.host ?? "localhost"}`).pathname);
  } catch {
    res.writeHead(400);
    return res.end("Invalid URL.");
  }
  const requested = path.resolve(root, `.${pathname}`);
  if (requested !== root && !requested.startsWith(`${root}${path.sep}`)) {
    res.writeHead(403);
    return res.end("Forbidden.");
  }

  let file = requested;
  try {
    if (!(await stat(file)).isFile()) file = indexFile;
  } catch {
    if ((req.headers.accept ?? "").includes("text/html")) file = indexFile;
    else {
      res.writeHead(404);
      return res.end("Not found.");
    }
  }

  try {
    const body = await readFile(file);
    res.writeHead(200, {
      "content-type": contentTypes.get(path.extname(file)) ?? "application/octet-stream",
      "x-content-type-options": "nosniff",
      "cache-control": file === indexFile ? "no-cache" : "public, max-age=31536000, immutable",
    });
    return res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.writeHead(404);
    return res.end("Not found.");
  }
}

const api = createApiMiddleware();
const server = createServer((req, res) => void api(req, res, () => void serveStatic(req, res)));
server.listen(port, host, () => console.log(`StudentPulse is listening on http://${host}:${port}`));

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => {
    db.close();
    process.exit(0);
  }));
}
