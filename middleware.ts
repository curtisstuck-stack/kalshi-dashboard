import { validateAuth } from "./api/_lib/auth";

/**
 * Vercel Edge Middleware — the shared-password gate (HANDOFF §5.4).
 * Runs on every route except /login, /api/auth/*, and static assets.
 * - Page routes without a valid session cookie -> 302 to /login?return=...
 * - /api/* routes without a session -> 401 JSON (so fetch() callers get a clean error)
 *
 * The data edge functions ALSO re-check auth (belt-and-suspenders, HANDOFF §5.2).
 */
export const config = {
  matcher: ["/((?!login|api/auth|assets/|favicon|icons|robots|_vercel).*)"],
};

export default async function middleware(req: Request): Promise<Response | undefined> {
  const { ok } = await validateAuth(req);
  if (ok) return undefined; // authenticated — let the request through

  const url = new URL(req.url);
  if (url.pathname.startsWith("/api/")) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const loginUrl = new URL("/login", url.origin);
  loginUrl.searchParams.set("return", url.pathname + url.search);
  return Response.redirect(loginUrl, 302);
}
