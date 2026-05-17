/**
 * Typed client for the /api/data/* edge functions.
 *
 * Every call is server-proxied — the GitHub PAT never reaches the browser.
 * A 401 means the session expired: we bounce to /login preserving the route.
 */
import type {
  Opportunity,
  Handover,
  Briefing,
  PortfolioSnapshot,
  LastCycle,
  HaltEvent,
} from "@/types";

const BASE = "/api/data";

export class NotFoundError extends Error {
  path: string;
  constructor(path: string) {
    super(`Not found: ${path}`);
    this.name = "NotFoundError";
    this.path = path;
  }
}

export interface Manifest {
  generated_at: string;
  /** The most recent date the pusher ran for (i.e. today). */
  latest_date: string;
  /** Most recent date with a non-empty opportunities array, or null. */
  latest_nonempty_date: string | null;
  schema_version: string;
  opportunity_count: number;
  warnings: string[];
  sources: Record<string, string | null>;
}

/** Market snapshot (orderbook + recent trades), as written by the pusher. */
export interface MarketSnapshot {
  as_of: string;
  n_markets: number;
  markets: SnapshotMarket[];
}

export interface SnapshotMarket {
  ticker: string;
  title?: string;
  category?: string;
  status?: string;
  yes_bid?: number;
  yes_ask?: number;
  last_price?: number;
  volume_24h?: number;
  open_interest?: number;
  orderbook?: unknown;
  recent_trades?: Array<Record<string, unknown>>;
}

export interface ResearchCache {
  as_of: string;
  n_articles: number;
  articles: ResearchArticle[];
}

export interface ResearchArticle {
  source_id: string;
  kind: string;
  url: string;
  title: string;
  published: string | null;
  summary: string;
  weight: number;
}

/** One line of health/mm_log.jsonl — a bot decision/quote event. */
export interface MmLogEvent {
  event: string;
  ticker?: string;
  iso_time?: string;
  timestamp?: number;
  [k: string]: unknown;
}

/** One line of portfolio/fills.jsonl — a simulated or live order fill. */
export interface Fill {
  event: string;
  mode?: string;
  ticker: string;
  side?: string;
  contracts?: number;
  entry_price?: number;
  edge?: number;
  conviction?: number;
  signal_source?: string;
  iso_time?: string;
  timestamp?: number;
}

/** One line of portfolio/settlements.jsonl — a resolved position. */
export interface Settlement {
  ticker: string;
  direction?: string;
  fill_price_cents?: number;
  contracts?: number;
  edge_at_entry?: number;
  signal_sources?: string[];
  outcome?: number;
  payout_cents?: number;
  net_pnl_cents?: number;
  settled_at?: string;
  settlement_note?: string;
}

/** One line of portfolio/pnl_history.{mode}.jsonl. */
export interface PnlPoint {
  ts: string;
  date?: string;
  mode: string;
  cash_usd: number;
  exposure_usd?: number;
  realized_pnl_day_usd?: number;
  realized_pnl_cum_usd?: number;
  unrealized_pnl_usd?: number;
}

interface FetchOpts {
  nocache?: boolean;
}

function url(path: string, nocache?: boolean): string {
  return nocache ? `${BASE}/${path}?nocache=1` : `${BASE}/${path}`;
}

async function get(path: string, nocache?: boolean): Promise<Response> {
  const res = await fetch(url(path, nocache), { credentials: "same-origin" });
  if (res.status === 401) {
    const ret = encodeURIComponent(
      window.location.pathname + window.location.search,
    );
    window.location.href = `/login?return=${ret}`;
    throw new Error("unauthorized");
  }
  return res;
}

async function getJson<T>(path: string, nocache?: boolean): Promise<T> {
  const res = await get(path, nocache);
  if (res.status === 404) throw new NotFoundError(path);
  if (!res.ok) throw new Error(`data fetch failed (${res.status}): ${path}`);
  return (await res.json()) as T;
}

async function getJsonl<T>(path: string, nocache?: boolean): Promise<T[]> {
  const res = await get(path, nocache);
  if (res.status === 404) throw new NotFoundError(path);
  if (!res.ok) throw new Error(`data fetch failed (${res.status}): ${path}`);
  const text = await res.text();
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => JSON.parse(l) as T);
}

// --- endpoints -------------------------------------------------------------

export const api = {
  manifest: (o?: FetchOpts) => getJson<Manifest>("meta/manifest", o?.nocache),

  opportunities: (date: string, o?: FetchOpts) =>
    getJson<Opportunity[]>(`opportunities/${date}`, o?.nocache),

  handover: (date: string, o?: FetchOpts) =>
    getJson<Handover>(`handover/${date}`, o?.nocache),

  briefing: (date: string, o?: FetchOpts) =>
    getJson<Briefing>(`briefing/${date}`, o?.nocache),

  briefingMarkdown: async (date: string, o?: FetchOpts) => {
    const res = await get(`briefing/${date}?format=md`, o?.nocache);
    if (res.status === 404) throw new NotFoundError(`briefing/${date}.md`);
    return res.text();
  },

  briefingsIndex: (o?: FetchOpts) =>
    getJson<{ dates: string[] }>("briefings/index", o?.nocache),

  snapshot: (date: string, o?: FetchOpts) =>
    getJson<MarketSnapshot>(`snapshot/${date}`, o?.nocache),

  researchCache: (date: string, o?: FetchOpts) =>
    getJson<ResearchCache>(`research-cache/${date}`, o?.nocache),

  mmLog: (o?: FetchOpts) => getJsonl<MmLogEvent>("health/mm-log", o?.nocache),

  portfolioSnapshot: (mode: "paper" | "live", o?: FetchOpts) =>
    getJson<PortfolioSnapshot>(`portfolio/snapshot?mode=${mode}`, o?.nocache),

  pnlHistory: (mode: "paper" | "live", o?: FetchOpts) =>
    getJsonl<PnlPoint>(`portfolio/pnl-history?mode=${mode}`, o?.nocache),

  fills: (o?: FetchOpts) => getJsonl<Fill>("portfolio/fills", o?.nocache),

  settlements: (o?: FetchOpts) =>
    getJsonl<Settlement>("portfolio/settlements", o?.nocache),

  lastCycle: (o?: FetchOpts) =>
    getJson<LastCycle>("health/last-cycle", o?.nocache),

  halts: (o?: FetchOpts) => getJson<HaltEvent[]>("health/halts", o?.nocache),
};
