import { validateAuth } from "../../_lib/auth";
import { listDirFromGithub } from "../../_lib/github";
import { cacheControl, jsonError } from "../../_lib/cache";

export const config = { runtime: "edge" };

/** Lists available briefings (dates) for the Research Archive sidebar. */
export default async function handler(req: Request): Promise<Response> {
  const auth = await validateAuth(req);
  if (!auth.ok) return jsonError("Unauthorized", 401);

  const url = new URL(req.url);
  const nocache = url.searchParams.get("nocache") === "1";
  const res = await listDirFromGithub("briefings");
  if (!res.ok) return jsonError("Upstream error", 502, { status: res.status });

  // Reduce to a sorted, de-duplicated list of dates that have a .json file.
  const entries = JSON.parse(res.body) as Array<{ name: string }>;
  const dates = entries
    .filter((e) => e.name.endsWith(".json"))
    .map((e) => e.name.replace(/\.json$/, ""))
    .sort()
    .reverse();

  return new Response(JSON.stringify({ dates }), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl(nocache),
    },
  });
}
