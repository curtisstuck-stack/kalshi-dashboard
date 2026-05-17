/** Parse research-engine handover outcomes.md into per-item status. */

export type OutcomeStatus = "LANDED" | "DEFERRED" | "REJECTED" | "OPEN";

export interface Outcome {
  status: OutcomeStatus;
  note: string;
}

const LINE = /(H-[A-Za-z0-9-]+)\s*[—–-]+\s*(LANDED|DEFERRED|REJECTED|OPEN)\b\s*(.*)/i;

/**
 * Parse lines like:
 *   - H-2026-05-14-001 — LANDED  (commit abc1234, +210/-12 LOC)
 * into a map keyed by handover item id.
 */
export function parseOutcomes(md: string): Record<string, Outcome> {
  const out: Record<string, Outcome> = {};
  for (const line of md.split("\n")) {
    const m = line.match(LINE);
    if (m) {
      out[m[1]] = {
        status: m[2].toUpperCase() as OutcomeStatus,
        note: m[3].trim().replace(/^[([]|[)\]]$/g, ""),
      };
    }
  }
  return out;
}

export const OUTCOME_TONE: Record<OutcomeStatus, string> = {
  LANDED: "bg-emerald-500/15 text-emerald-400",
  DEFERRED: "bg-amber-500/15 text-amber-400",
  REJECTED: "bg-rose-500/15 text-rose-400",
  OPEN: "bg-sky-500/15 text-sky-400",
};

/** Aggregate theme-tag frequency across briefings. */
export function tagFrequency(
  briefings: { tags?: string[] }[],
): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const b of briefings) {
    for (const t of b.tags ?? []) {
      counts.set(t, (counts.get(t) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
