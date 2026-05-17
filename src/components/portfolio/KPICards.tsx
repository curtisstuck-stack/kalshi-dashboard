import { Card } from "@/components/ui/card";
import { usd, usdSigned, pct } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Kpis } from "@/lib/portfolio";

export type PortfolioMode = "paper" | "live" | "both";

interface Props {
  mode: PortfolioMode;
  paper: Kpis;
  live: Kpis;
  paperExposureUsd?: number;
  liveExposureUsd?: number;
}

type Metric = {
  label: string;
  value: (k: Kpis, exposure?: number) => string;
  tone?: (k: Kpis) => string;
};

const METRICS: Metric[] = [
  {
    label: "Total P&L",
    value: (k) => usdSigned(k.totalPnlUsd),
    tone: (k) => (k.totalPnlUsd < 0 ? "text-rose-400" : "text-emerald-400"),
  },
  { label: "Trades", value: (k) => String(k.tradeCount) },
  { label: "Win rate", value: (k) => (k.winRate == null ? "—" : pct(k.winRate, 0)) },
  { label: "Avg win", value: (k) => (k.avgWinUsd == null ? "—" : usd(k.avgWinUsd)) },
  {
    label: "Avg loss",
    value: (k) => (k.avgLossUsd == null ? "—" : usd(k.avgLossUsd)),
  },
  {
    label: "Expectancy",
    value: (k) => (k.expectancyUsd == null ? "—" : usdSigned(k.expectancyUsd)),
    tone: (k) =>
      (k.expectancyUsd ?? 0) < 0 ? "text-rose-400" : "text-emerald-400",
  },
  { label: "Max drawdown", value: (k) => usd(k.maxDrawdownUsd) },
  {
    label: "Open exposure",
    value: (_k, exposure) => (exposure == null ? "—" : usd(exposure)),
  },
];

/** Headline KPI cards (HANDOFF §4.3.A) — paper and live side-by-side in `both`. */
export function KPICards({
  mode,
  paper,
  live,
  paperExposureUsd,
  liveExposureUsd,
}: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {METRICS.map((m) => (
        <Card key={m.label} className="p-3">
          <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {m.label}
          </div>
          {mode === "both" ? (
            <div className="mt-1 grid grid-cols-2 gap-2">
              <Value
                tag="paper"
                text={m.value(paper, paperExposureUsd)}
                tone={m.tone?.(paper)}
              />
              <Value
                tag="live"
                text={m.value(live, liveExposureUsd)}
                tone={m.tone?.(live)}
              />
            </div>
          ) : (
            <div className="mt-1">
              <Value
                text={
                  mode === "paper"
                    ? m.value(paper, paperExposureUsd)
                    : m.value(live, liveExposureUsd)
                }
                tone={m.tone?.(mode === "paper" ? paper : live)}
              />
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}

function Value({
  text,
  tone,
  tag,
}: {
  text: string;
  tone?: string;
  tag?: string;
}) {
  return (
    <div>
      {tag && (
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground/70">
          {tag}
        </div>
      )}
      <div className={cn("text-base font-semibold tabular-nums", tone)}>
        {text}
      </div>
    </div>
  );
}
