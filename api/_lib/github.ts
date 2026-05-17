/**
 * Server-side fetch from the private kalshi-dashboard-data repo.
 *
 * Uses the GitHub Contents API (api.github.com/repos/.../contents/{path}) with
 * `Accept: application/vnd.github.raw` — NOT raw.githubusercontent.com, which
 * ignores bearer tokens for private repos. Documented deviation from HANDOFF §5.3.
 *
 * The PAT (GITHUB_TOKEN_DASHBOARD_DATA) is read-only on that one repo and is
 * NEVER sent to the client — these helpers run only in edge functions.
 */

const GITHUB_API = "https://api.github.com";

export interface RawResult {
  ok: boolean;
  status: number;
  body: string;
}

/** Fetch a single file's raw contents from the data repo. */
export async function fetchRawFromGithub(
  path: string,
  nocache: boolean,
): Promise<RawResult> {
  const owner = process.env.DASHBOARD_DATA_OWNER ?? "curtisstuck-stack";
  const repo = process.env.DASHBOARD_DATA_REPO ?? "kalshi-dashboard-data";
  const token = process.env.GITHUB_TOKEN_DASHBOARD_DATA;

  if (!token) {
    return { ok: false, status: 500, body: "GITHUB_TOKEN_DASHBOARD_DATA not set" };
  }

  // Encode each path segment but keep the slashes.
  const encoded = path.split("/").map(encodeURIComponent).join("/");
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${encoded}?ref=main`;

  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github.raw",
      Authorization: `Bearer ${token}`,
      "User-Agent": "kalshi-dashboard",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    // Bust GitHub's own CDN cache on a manual refresh.
    cache: nocache ? "no-store" : "default",
  });

  if (res.status === 404) return { ok: false, status: 404, body: "" };
  if (!res.ok) {
    return { ok: false, status: res.status, body: await res.text() };
  }
  return { ok: true, status: 200, body: await res.text() };
}

export interface DirEntry {
  name: string;
  path: string;
  size: number;
}

/** List a directory in the data repo via the Contents API. */
export async function listDirFromGithub(dir: string): Promise<RawResult> {
  const owner = process.env.DASHBOARD_DATA_OWNER ?? "curtisstuck-stack";
  const repo = process.env.DASHBOARD_DATA_REPO ?? "kalshi-dashboard-data";
  const token = process.env.GITHUB_TOKEN_DASHBOARD_DATA;
  if (!token) {
    return { ok: false, status: 500, body: "GITHUB_TOKEN_DASHBOARD_DATA not set" };
  }

  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${dir}?ref=main`;
  const res = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "User-Agent": "kalshi-dashboard",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (res.status === 404) return { ok: false, status: 404, body: "[]" };
  if (!res.ok) return { ok: false, status: res.status, body: await res.text() };

  const raw = (await res.json()) as Array<{
    name: string;
    path: string;
    size: number;
    type: string;
  }>;
  const entries: DirEntry[] = raw
    .filter((e) => e.type === "file")
    .map((e) => ({ name: e.name, path: e.path, size: e.size }));
  return { ok: true, status: 200, body: JSON.stringify(entries) };
}
