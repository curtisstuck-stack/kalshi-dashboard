/**
 * Shared edge-function handler for every api/data/* route.
 *
 * Each route supplies a `derivePath(url)` that maps the request to a file path
 * in the data repo. The handler does auth, fetch, error mapping, and caching so
 * the route files stay one-liners.
 */
import { validateAuth } from "./auth";
import { fetchRawFromGithub } from "./github";
import { cacheControl, jsonError } from "./cache";

export type DerivePath = (url: URL) => string | null;

export function makeDataHandler(derivePath: DerivePath) {
  return async function handler(req: Request): Promise<Response> {
    // Belt-and-suspenders: middleware already gates, but data routes re-check
    // (HANDOFF §5.2 — sensitive routes double-check the cookie).
    const auth = await validateAuth(req);
    if (!auth.ok) return jsonError("Unauthorized", 401);

    const url = new URL(req.url);
    const path = derivePath(url);
    if (!path) return jsonError("Bad request", 400);

    const nocache = url.searchParams.get("nocache") === "1";
    const res = await fetchRawFromGithub(path, nocache);

    if (res.status === 404) return jsonError("Not found", 404, { path });
    if (!res.ok) return jsonError("Upstream error", 502, { status: res.status });

    const isJsonl = path.endsWith(".jsonl");
    return new Response(res.body, {
      status: 200,
      headers: {
        "content-type": isJsonl
          ? "text/plain; charset=utf-8"
          : "application/json; charset=utf-8",
        "cache-control": cacheControl(nocache),
        "x-data-path": path,
      },
    });
  };
}

/** Pull a trailing YYYY-MM-DD off a pathname, or null. */
export function dateFromPath(url: URL): string | null {
  const m = url.pathname.match(/(\d{4}-\d{2}-\d{2})$/);
  return m ? m[1] : null;
}
