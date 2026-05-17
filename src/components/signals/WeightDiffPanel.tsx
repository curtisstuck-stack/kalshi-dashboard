import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { cn } from "@/lib/utils";
import type { SignalWeights } from "@/types";
import type { SignalRecommendations } from "@/lib/api";

interface Props {
  weights?: SignalWeights;
  recommendations?: SignalRecommendations;
}

/** Current vs recommended signal weights (HANDOFF §4.4.C). */
export function WeightDiffPanel({ weights, recommendations }: Props) {
  const current = (weights?.signals ?? {}) as Record<string, { weight?: number }>;
  const recs = recommendations?.signals ?? {};
  const names = Object.keys(recs);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Weight recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {names.length === 0 ? (
          <EmptyState title="No weight recommendations available" />
        ) : (
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr className="border-b border-border">
                <th className="px-2 py-1.5 text-left">Signal</th>
                <th className="px-2 py-1.5 text-right">Current</th>
                <th className="px-2 py-1.5 text-right">Recommended</th>
                <th className="px-2 py-1.5 text-right">Δ</th>
              </tr>
            </thead>
            <tbody>
              {names.map((name) => {
                const cur = current[name]?.weight ?? 1.0;
                const rec = recs[name]?.multiplier ?? 1.0;
                const delta = rec - cur;
                return (
                  <tr key={name} className="border-b border-border/50">
                    <td className="px-2 py-1.5 font-mono text-xs">{name}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {cur.toFixed(2)}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {rec.toFixed(2)}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-1.5 text-right tabular-nums",
                        delta > 0.01
                          ? "text-emerald-400"
                          : delta < -0.01
                            ? "text-rose-400"
                            : "text-muted-foreground",
                      )}
                    >
                      <span className="inline-flex items-center gap-0.5">
                        {delta > 0.01 ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : delta < -0.01 ? (
                          <ArrowDown className="h-3 w-3" />
                        ) : (
                          <Minus className="h-3 w-3" />
                        )}
                        {delta >= 0 ? "+" : ""}
                        {delta.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {weights?.placeholder && (
          <p className="mt-2 text-xs text-muted-foreground">
            “Current” defaults to 1.00 — the bot doesn’t yet publish live signal
            weights, so deltas are vs the neutral baseline.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
