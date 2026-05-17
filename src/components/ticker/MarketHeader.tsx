import { priceCents, num, countdown } from "@/lib/format";
import { categoryTone, archetypeMeta } from "@/lib/archetypes";
import { scoreTone } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/types";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium tabular-nums">{value}</div>
    </div>
  );
}

/** Market header for Ticker Detail (HANDOFF §4.2.A). */
export function MarketHeader({ opp }: { opp: Opportunity }) {
  const arch = archetypeMeta(opp.archetype);
  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg font-semibold leading-tight">{opp.title}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {opp.ticker}
            </span>
            <span className={cn("rounded px-1.5 py-0.5 text-xs", categoryTone(opp.category))}>
              {opp.category}
            </span>
            <span className={cn("rounded px-1.5 py-0.5 text-xs", arch.tone)}>
              {arch.label}
            </span>
          </div>
        </div>
        <span
          className={cn(
            "shrink-0 rounded-md px-2 py-1 text-sm font-semibold tabular-nums",
            scoreTone(opp.score),
          )}
        >
          Score {num(opp.score, 3)}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        <Stat label="Mid" value={priceCents(opp.mid)} />
        <Stat label="Spread" value={priceCents(opp.spread)} />
        <Stat
          label="Volume 24h"
          value={opp.volume_24h != null ? `$${num(opp.volume_24h, 0)}` : "—"}
        />
        <Stat
          label="Open interest"
          value={opp.open_interest != null ? num(opp.open_interest, 0) : "—"}
        />
        <Stat label="Closes in" value={countdown(opp.hours_to_close)} />
      </div>
    </div>
  );
}
