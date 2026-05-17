import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { priceCents } from "@/lib/format";
import { edgeLabel, edgeColor } from "@/lib/scoring";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/types";

/** Fair-value vs market gauge (HANDOFF §4.2.D). */
export function FairValueGauge({ opp }: { opp: Opportunity }) {
  const { mid, fair_value: fv, edge } = opp;
  const e = edgeLabel(edge);
  const hasFV = typeof fv === "number";
  const clamp = (n: number) => Math.max(0, Math.min(1, n));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Fair value vs market</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 0..1 probability track with mid + fair-value markers */}
        <div className="relative h-8">
          <div className="absolute inset-x-0 top-3.5 h-1 rounded bg-secondary" />
          {typeof mid === "number" && (
            <Marker pos={clamp(mid)} color="bg-foreground" label="Mid" />
          )}
          {hasFV && (
            <Marker pos={clamp(fv as number)} color="bg-emerald-400" label="Fair" up />
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 text-sm">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Market mid
            </div>
            <div className="tabular-nums">{priceCents(mid)}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Fair value
            </div>
            <div className="tabular-nums">{hasFV ? priceCents(fv) : "—"}</div>
          </div>
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Edge
            </div>
            <div className={cn("tabular-nums font-medium", edgeColor(e.sign))}>
              {e.text}
            </div>
          </div>
        </div>

        {!hasFV && (
          <p className="text-xs text-muted-foreground">
            No fair-value model for this market — spread-capture only.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Marker({
  pos,
  color,
  label,
  up,
}: {
  pos: number;
  color: string;
  label: string;
  up?: boolean;
}) {
  return (
    <div
      className="absolute flex flex-col items-center"
      style={{ left: `${pos * 100}%`, transform: "translateX(-50%)" }}
    >
      {!up && <span className="text-[10px] text-muted-foreground">{label}</span>}
      <div className={cn("h-4 w-1 rounded", color)} />
      {up && <span className="text-[10px] text-muted-foreground">{label}</span>}
    </div>
  );
}
