import { useState } from "react";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { usd } from "@/lib/format";
import { attribution } from "@/lib/portfolio";
import type { Settlement } from "@/lib/api";

/** P&L attribution (HANDOFF §4.3.F) — realized P&L grouped by signal or direction. */
export function AttributionChart({ settlements }: { settlements: Settlement[] }) {
  const [by, setBy] = useState<"signal" | "direction">("signal");
  const rows = attribution(settlements, by);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">P&L attribution</CardTitle>
        <div className="flex gap-1">
          {(["signal", "direction"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setBy(k)}
              className={`rounded px-2 py-0.5 text-xs capitalize ${
                by === k
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState title="No settled trades to attribute" />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rows} margin={{ left: 4, right: 8, top: 4 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  dataKey="key"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis
                  tickFormatter={(v) => usd(v)}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  width={64}
                />
                <Tooltip
                  cursor={{ fill: "hsl(var(--secondary))" }}
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(v, _n, p) => [
                    `${usd(Number(v))} · ${(p?.payload as { trades?: number })?.trades ?? 0} trades`,
                    "P&L",
                  ]}
                />
                <Bar dataKey="pnlUsd" radius={[3, 3, 0, 0]}>
                  {rows.map((r, i) => (
                    <Cell
                      key={i}
                      fill={
                        r.pnlUsd < 0 ? "hsl(350 80% 55%)" : "hsl(168 70% 45%)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
