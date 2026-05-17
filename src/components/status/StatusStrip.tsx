import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FreshnessBadge } from "./FreshnessBadge";
import { useRefresh } from "@/hooks/refresh";
import { freshness } from "@/lib/scoring";
import { usd, usdSigned, timeUTC } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LastCycle, PortfolioSnapshot, Briefing } from "@/types";

interface Props {
  lastCycle?: LastCycle;
  paper?: PortfolioSnapshot;
  briefing?: Briefing;
}

/** Derive a coarse bot state from cycle freshness + halts. */
function botState(lc?: LastCycle): { label: string; tone: string } {
  if (!lc) return { label: "Unknown", tone: "bg-muted text-muted-foreground" };
  const fresh = freshness(lc.generated_at).level;
  if (fresh === "dead")
    return { label: "Offline", tone: "bg-rose-500/15 text-rose-400" };
  if ((lc.halts_triggered?.length ?? 0) > 0)
    return { label: "Halted", tone: "bg-amber-500/15 text-amber-400" };
  return { label: "Running", tone: "bg-emerald-500/15 text-emerald-400" };
}

function Metric({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="truncate text-sm font-medium tabular-nums">{children}</div>
    </div>
  );
}

/** Header strip — bot state, last cycle, paper P&L, research-engine run, refresh. */
export function StatusStrip({ lastCycle, paper, briefing }: Props) {
  const { refresh, lastFetched } = useRefresh();
  const state = botState(lastCycle);

  const onRefresh = () => {
    refresh();
    toast.success(`Fetched at ${timeUTC(Date.now())}`);
  };

  const pnlToday = paper?.realized_pnl_today_usd;

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-xs font-semibold",
            state.tone,
          )}
        >
          Bot: {state.label}
        </span>
      </div>

      <Metric label="Last cycle">
        <FreshnessBadge ts={lastCycle?.generated_at} />
      </Metric>

      <Metric label="Paper P&L today">
        <span
          className={cn(
            pnlToday != null && pnlToday < 0
              ? "text-rose-400"
              : pnlToday
                ? "text-emerald-400"
                : "",
          )}
        >
          {pnlToday != null ? usdSigned(pnlToday) : "—"}
        </span>
      </Metric>

      <Metric label="Paper balance">{paper ? usd(paper.cash_usd) : "—"}</Metric>

      <Metric label="Research engine">
        <FreshnessBadge ts={briefing?.generated_at} />
      </Metric>

      <div className="ml-auto flex items-center gap-3">
        {lastFetched && (
          <span className="text-xs text-muted-foreground">
            Fetched {timeUTC(lastFetched)}
          </span>
        )}
        <Button size="sm" variant="outline" onClick={onRefresh}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Refresh
        </Button>
      </div>
    </div>
  );
}
