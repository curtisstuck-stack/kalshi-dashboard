/** Edge-cache header helpers (HANDOFF §5.1 — 60s edge cache, manual bust). */

/** cache-control for a data response. nocache -> no-store; else 60s + SWR. */
export function cacheControl(nocache: boolean): string {
  return nocache ? "no-store" : "s-maxage=60, stale-while-revalidate=300";
}

/** A JSON Response with no caching — for errors and auth failures. */
export function jsonError(message: string, status: number, extra?: Record<string, unknown>): Response {
  return new Response(JSON.stringify({ error: message, ...extra }), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}
