import {
  Line,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { pct } from "@/lib/format";
import type { ReliabilityBucket } from "@/lib/api";

/** Calibration reliability diagram (HANDOFF §4.4.B). */
export function ReliabilityDiagram({ buckets }: { buckets?: ReliabilityBucket[] }) {
  const data = (buckets ?? [])
    .filter((b) => b.realized != null && b.count > 0)
    .map((b) => ({
      predicted: b.predicted,
      realized: b.realized as number,
      count: b.count,
    }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Calibration reliability</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title="No calibration samples yet" />
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ left: 4, right: 8, top: 4 }}>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="predicted"
                  domain={[0, 1]}
                  tickFormatter={(v) => pct(v, 0)}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  label={{
                    value: "Predicted",
                    position: "insideBottom",
                    offset: -2,
                    fontSize: 10,
                  }}
                />
                <YAxis
                  type="number"
                  dataKey="realized"
                  domain={[0, 1]}
                  tickFormatter={(v) => pct(v, 0)}
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  width={44}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                  formatter={(v, n) => [pct(Number(v)), n]}
                />
                {/* Perfect-calibration diagonal */}
                <ReferenceLine
                  segment={[
                    { x: 0, y: 0 },
                    { x: 1, y: 1 },
                  ]}
                  stroke="hsl(var(--muted-foreground))"
                  strokeDasharray="4 4"
                />
                <Line
                  type="monotone"
                  dataKey="realized"
                  stroke="hsl(168 70% 50%)"
                  dot={{ r: 3 }}
                  name="Realized"
                />
                <Scatter dataKey="realized" fill="hsl(168 70% 50%)" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        <p className="mt-2 text-xs text-muted-foreground">
          Points on the dashed diagonal are perfectly calibrated; below = the
          model is over-confident.
        </p>
      </CardContent>
    </Card>
  );
}
