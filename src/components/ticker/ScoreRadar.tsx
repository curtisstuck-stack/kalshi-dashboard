import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import type { Opportunity } from "@/types";

const COMPONENTS: { key: string; label: string }[] = [
  { key: "liquidity", label: "Liquidity" },
  { key: "spread_capture", label: "Spread" },
  { key: "fair_value_edge", label: "FV edge" },
  { key: "time_to_resolution", label: "Time" },
  { key: "vol_regime", label: "Vol regime" },
  { key: "info_density", label: "Info" },
];

/** Six-axis radar of the component scores (HANDOFF §4.2.B). */
export function ScoreRadar({ opp }: { opp: Opportunity }) {
  const cs = (opp.component_scores ?? {}) as Record<string, number>;
  const data = COMPONENTS.map((c) => ({
    axis: c.label,
    value: typeof cs[c.key] === "number" ? cs[c.key] : 0,
  }));
  const hasAny = COMPONENTS.some((c) => typeof cs[c.key] === "number");

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Score breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {hasAny ? (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data} outerRadius="72%">
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis
                  dataKey="axis"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                />
                <PolarRadiusAxis
                  domain={[0, 1]}
                  tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }}
                  tickCount={3}
                />
                <Radar
                  dataKey="value"
                  stroke="hsl(168 70% 50%)"
                  fill="hsl(168 70% 50%)"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <EmptyState title="No component scores for this market" />
        )}
      </CardContent>
    </Card>
  );
}
