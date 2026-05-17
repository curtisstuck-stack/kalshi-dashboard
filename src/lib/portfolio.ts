/** Portfolio analytics derived from settlement records (HANDOFF §4.3). */
import type { Settlement } from "./api";

const cents = (n: number | undefined) => (n ?? 0) / 100;

export interface Kpis {
  tradeCount: number;
  totalPnlUsd: number;
  winCount: number;
  lossCount: number;
  winRate: number | null;
  avgWinUsd: number | null;
  avgLossUsd: number | null;
  expectancyUsd: number | null;
  maxDrawdownUsd: number;
}

/** Filter settlements to a trailing window in days (null = all time). */
export function withinWindow(
  settlements: Settlement[],
  days: number | null,
): Settlement[] {
  if (days == null) return settlements;
  const cutoff = Date.now() - days * 86_400_000;
  return settlements.filter((s) => {
    const t = s.settled_at ? Date.parse(s.settled_at) : NaN;
    return !Number.isNaN(t) && t >= cutoff;
  });
}

export function computeKpis(settlements: Settlement[]): Kpis {
  const pnls = settlements.map((s) => cents(s.net_pnl_cents));
  const wins = pnls.filter((p) => p > 0);
  const losses = pnls.filter((p) => p < 0);
  const total = pnls.reduce((a, b) => a + b, 0);
  const decided = wins.length + losses.length;

  return {
    tradeCount: settlements.length,
    totalPnlUsd: total,
    winCount: wins.length,
    lossCount: losses.length,
    winRate: decided ? wins.length / decided : null,
    avgWinUsd: wins.length ? wins.reduce((a, b) => a + b, 0) / wins.length : null,
    avgLossUsd: losses.length
      ? losses.reduce((a, b) => a + b, 0) / losses.length
      : null,
    expectancyUsd: settlements.length ? total / settlements.length : null,
    maxDrawdownUsd: maxDrawdown(equitySeries(settlements).map((p) => p.cumUsd)),
  };
}

export interface EquityPoint {
  ts: number;
  label: string;
  cumUsd: number;
}

/** Cumulative realized P&L over time, ordered by settlement timestamp. */
export function equitySeries(settlements: Settlement[]): EquityPoint[] {
  const sorted = [...settlements]
    .filter((s) => s.settled_at)
    .sort((a, b) => Date.parse(a.settled_at!) - Date.parse(b.settled_at!));
  let cum = 0;
  return sorted.map((s) => {
    cum += cents(s.net_pnl_cents);
    const ts = Date.parse(s.settled_at!);
    return { ts, label: s.settled_at!.slice(0, 10), cumUsd: cum };
  });
}

/** Largest peak-to-trough drop in a cumulative-P&L sequence (returned positive). */
export function maxDrawdown(cum: number[]): number {
  let peak = -Infinity;
  let worst = 0;
  for (const v of cum) {
    peak = Math.max(peak, v);
    worst = Math.min(worst, v - peak);
  }
  return Math.abs(worst);
}

export interface AttributionRow {
  key: string;
  pnlUsd: number;
  trades: number;
}

/** Group realized P&L by a settlement dimension. */
export function attribution(
  settlements: Settlement[],
  by: "signal" | "direction",
): AttributionRow[] {
  const map = new Map<string, { pnlUsd: number; trades: number }>();
  for (const s of settlements) {
    const key =
      by === "signal"
        ? s.signal_sources?.[0] ?? "unattributed"
        : (s.direction ?? "—").toUpperCase();
    const row = map.get(key) ?? { pnlUsd: 0, trades: 0 };
    row.pnlUsd += cents(s.net_pnl_cents);
    row.trades += 1;
    map.set(key, row);
  }
  return [...map.entries()]
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => b.pnlUsd - a.pnlUsd);
}
