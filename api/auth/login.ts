import { signToken, sessionCookie, timingSafeEqual } from "../_lib/auth";

export const config = { runtime: "edge" };

/** POST { password } -> 200 + Set-Cookie on match, 401 otherwise. */
export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const sitePassword = process.env.SITE_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;
  if (!sitePassword || !jwtSecret) {
    return new Response(
      JSON.stringify({ error: "Server auth not configured" }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
  }

  let password = "";
  try {
    const body = (await req.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return new Response("Bad Request", { status: 400 });
  }

  if (!timingSafeEqual(password, sitePassword)) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  const token = await signToken(jwtSecret);
  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "content-type": "application/json",
      "set-cookie": sessionCookie(token),
    },
  });
}
