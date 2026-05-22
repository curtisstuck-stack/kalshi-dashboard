import { useMemo, useState } from "react";
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { usd, dateLong } from "@/lib/format";
import type { EquityPoint } from "@/lib/portfolio";
import type { PortfolioMode } from "./KPICards";

const RANGES: { key: string; days: number | null; label: string }[] = [
  { key: "7d", days: 7, label: "7d" },
  { key: "30d", days: 30, label: "30d" },
  { key: "90d", days: 90, label: "90d" },
  { key: "all", days: null, label: "All" },
];

interface MergedPoint {
  ts: number;
  paper?: number;
  live?: number;
}

function merge(paper: EquityPoint[], live: EquityPoint[]): MergedPoint[] {
  const by = new Map<number, MergedPoint>();
  for (const p of paper) {
    const row = by.get(p.ts) ?? { ts: p.ts };
    row.paper = p.cumUsd;
    by.set(p.ts, row);
  }
  for (const l of live) {
    const row = by.get(l.ts) ?? { ts: l.ts };
    row.live = l.cumUsd;
    by.set(l.ts, row);
  }
  return [...by.values()].sort((a, b) => a.ts - b.ts);
}

/** Cumulative-P&L equity curve (HANDOFF §4.3.B) — paper + live dual series. */
export function EquityCurve({
  paper,
  live,
  mode,
}: {
  paper: EquityPoint[];
  live: EquityPoint[];
  mode: PortfolioMode;
}) {
  const [range, setRange] = useState("all");
  const days = RANGES.find((r) => r.key === range)?.days ?? null;

  const data = useMemo(() => {
    const all = merge(paper, live);
    if (days == null) return all;
    const cutoff = Date.now() - days * 86_400_000;
    return all.filter((p) => p.ts >= cutoff);
  }, [paper, live, days]);

  const showPaper = mode !== "live";
  // Only draw the live series (and its legend) once live data actually exists.
  const showLive = mode !== "paper" && live.length > 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Equity curve</CardTitle>
        <div className="flex gap-1">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded px-2 py-0.5 text-xs ${
                range === r.key
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 || (!showPaper && !showLive) ? (
          <EmptyState title="No settled trades in this range" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 4, right: 8, top: 4 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="ts"
                  type="number"
                  scale="time"
                  domain={["dataMin", "dataMax"]}
                  tickFormatter={(t) => new Date(t).toISOString().slice(5, 10)}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                />
                <YAxis
                  tickFormatter={(v) => usd(v)}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  width={64}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  labelFormatter={(t) => dateLong(new Date(Number(t)).toISOString())}
                  formatter={(v) => usd(Number(v))}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {showPaper && (
                  <Line
                    type="monotone"
                    dataKey="paper"
                    name="Paper"
                    stroke="hsl(168 70% 50%)"
                    strokeDasharray="5 3"
                    dot={false}
                    connectNulls
                  />
                )}
                {showLive && (
                  <Line
                    type="monotone"
                    dataKey="live"
                    name="Live"
                    stroke="hsl(38 92% 55%)"
                    dot={false}
                    connectNulls
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
