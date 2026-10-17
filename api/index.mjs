process.env.STUDENTPULSE_DB_PATH ??= "/tmp/studentpulse.sqlite";

const { createApiMiddleware } = await import("../server/api.mjs");
const handleApi = createApiMiddleware();

export default function handler(req, res) {
  const requestUrl = new URL(req.url ?? "/api", `https://${req.headers.host ?? "localhost"}`);
  const route = requestUrl.searchParams.get("route") ?? "";
  requestUrl.searchParams.delete("route");
  req.url = `/api/${route}${requestUrl.search}`;

  return handleApi(req, res, () => {
    res.writeHead(404, { "content-type": "application/json; charset=utf-8" });
    res.end(JSON.stringify({ error: "API route was not found." }));
  });
}
