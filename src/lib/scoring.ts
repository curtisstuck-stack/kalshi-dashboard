/** Client-side derived metrics: score buckets, edge labels, data freshness. */
import { ageMinutes } from "./format";

/** Tailwind text-color class for an opportunity score (0..1). */
export function scoreColor(score: number | null | undefined): string {
  if (score == null) return "text-muted-foreground";
  if (score >= 0.5) return "text-emerald-400";
  if (score >= 0.35) return "text-amber-400";
  return "text-muted-foreground";
}

/** Background/badge tone for a score. */
export function scoreTone(score: number | null | undefined): string {
  if (score == null) return "bg-muted text-muted-foreground";
  if (score >= 0.5) return "bg-emerald-500/15 text-emerald-400";
  if (score >= 0.35) return "bg-amber-500/15 text-amber-400";
  return "bg-muted text-muted-foreground";
}

/**
 * Edge is reported in half-spreads. Positive = market underpriced vs fair value.
 * Returns a short label + sign for color coding.
 */
export function edgeLabel(edge: number | null | undefined): {
  text: string;
  sign: "pos" | "neg" | "none";
} {
  if (edge == null || Number.isNaN(edge)) return { text: "—", sign: "none" };
  const sign = edge > 0.25 ? "pos" : edge < -0.25 ? "neg" : "none";
  return { text: `${edge > 0 ? "+" : ""}${edge.toFixed(2)} hs`, sign };
}

export function edgeColor(sign: "pos" | "neg" | "none"): string {
  return sign === "pos"
    ? "text-emerald-400"
    : sign === "neg"
      ? "text-rose-400"
      : "text-muted-foreground";
}

export type Freshness = "fresh" | "stale" | "dead";

/**
 * Data-freshness tiers (PLAN §5.5): fresh < 90 min, stale 90 min–4 h, dead > 4 h.
 */
export function freshness(ts: string | number | null | undefined): {
  level: Freshness;
  minutes: number | null;
} {
  const minutes = ageMinutes(ts);
  if (minutes == null) return { level: "dead", minutes: null };
  if (minutes < 90) return { level: "fresh", minutes };
  if (minutes < 240) return { level: "stale", minutes };
  return { level: "dead", minutes };
}

export function freshnessTone(level: Freshness): string {
  return level === "fresh"
    ? "bg-emerald-500/15 text-emerald-400"
    : level === "stale"
      ? "bg-amber-500/15 text-amber-400"
      : "bg-rose-500/15 text-rose-400";
}
