import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Info } from "lucide-react";
import { KPICards, type PortfolioMode } from "@/components/portfolio/KPICards";
import { EquityCurve } from "@/components/portfolio/EquityCurve";
import { OpenPositionsTable } from "@/components/portfolio/OpenPositionsTable";
import { FillsTable } from "@/components/portfolio/FillsTable";
import { SettlementTable } from "@/components/portfolio/SettlementTable";
import { AttributionChart } from "@/components/portfolio/AttributionChart";
import { LoadingSkeleton, ErrorState } from "@/components/common/QueryStates";
import {
  useSettlements,
  useFills,
  usePortfolioSnapshot,
} from "@/hooks/data";
import {
  computeKpis,
  equitySeries,
  withinWindow,
} from "@/lib/portfolio";

const MODES: PortfolioMode[] = ["paper", "live", "both"];
const WINDOWS: { key: string; days: number | null; label: string }[] = [
  { key: "all", days: null, label: "All-time" },
  { key: "30d", days: 30, label: "30d" },
  { key: "7d", days: 7, label: "7d" },
];

export default function Portfolio() {
  const [params, setParams] = useSearchParams();
  const mode = (
    MODES.includes(params.get("mode") as PortfolioMode)
      ? params.get("mode")
      : "paper"
  ) as PortfolioMode;
  const windowKey = params.get("window") ?? "all";
  const windowDays = WINDOWS.find((w) => w.key === windowKey)?.days ?? null;

  const settlements = useSettlements();
  const fills = useFills();
  const paperSnap = usePortfolioSnapshot("paper");
  const liveSnap = usePortfolioSnapshot("live");

  // All settlement/fill records are paper — the bot has no live trading history.
  const paperSettlements = settlements.data ?? [];
  const paperFills = fills.data ?? [];

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    next.set(key, value);
    setParams(next, { replace: true });
  };

  const windowed = useMemo(
    () => withinWindow(paperSettlements, windowDays),
    [paperSettlements, windowDays],
  );
  const paperKpis = useMemo(() => computeKpis(windowed), [windowed]);
  const liveKpis = useMemo(() => computeKpis([]), []);
  const paperEquity = useMemo(
    () => equitySeries(paperSettlements),
    [paperSettlements],
  );

  const resolved =
    settlements.isError || settlements.data !== undefined;
  const showLiveEmptyNote = mode !== "paper";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-semibold tracking-tight">
          Paper + Live Portfolio
        </h1>
        <div className="flex items-center gap-3">
          <Toggle
            options={WINDOWS.map((w) => ({ key: w.key, label: w.label }))}
            value={windowKey}
            onChange={(v) => setParam("window", v)}
          />
          <Toggle
            options={MODES.map((m) => ({ key: m, label: m }))}
            value={mode}
            onChange={(v) => setParam("mode", v)}
          />
        </div>
      </div>

      {showLiveEmptyNote && (
        <div className="flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Live trading is gated — the bot is balance-floored, so all P&amp;L
            shown is paper. Live columns read “—” until live execution begins.
          </span>
        </div>
      )}

      {!resolved ? (
        <LoadingSkeleton rows={8} />
      ) : settlements.isError ? (
        <ErrorState
          error={settlements.error}
          onRetry={() => settlements.refetch()}
        />
      ) : (
        <>
          <KPICards
            mode={mode}
            paper={paperKpis}
            live={liveKpis}
            paperExposureUsd={paperSnap.data?.exposure_usd}
            liveExposureUsd={liveSnap.data?.exposure_usd}
          />

          <EquityCurve paper={paperEquity} live={[]} mode={mode} />

          <div className="grid gap-4 lg:grid-cols-2">
            <OpenPositionsTable
              paper={paperSnap.data}
              live={liveSnap.data}
              mode={mode}
            />
            <AttributionChart settlements={windowed} />
            <FillsTable fills={paperFills} />
            <SettlementTable settlements={windowed} />
          </div>
        </>
      )}
    </div>
  );
}

function Toggle({
  options,
  value,
  onChange,
}: {
  options: { key: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex rounded-md border border-border p-0.5">
      {options.map((o) => (
        <button
          key={o.key}
          onClick={() => onChange(o.key)}
          className={`rounded px-2.5 py-1 text-xs capitalize transition-colors ${
            value === o.key
              ? "bg-secondary text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
