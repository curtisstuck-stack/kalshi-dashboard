import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { PlayPill } from "@/components/opportunities/PlayPill";
import { priceCents, usd } from "@/lib/format";
import type { Opportunity } from "@/types";

type Play = NonNullable<Opportunity["plays"]>[number];

function Leg({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm tabular-nums">{value}</div>
    </div>
  );
}

/** Suggested plays for this market (HANDOFF §4.2.E). */
export function PlayList({ plays }: { plays?: Opportunity["plays"] }) {
  const list = (plays ?? []) as Play[];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Suggested plays</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {list.length === 0 ? (
          <EmptyState title="No plays suggested for this market" />
        ) : (
          list.map((p, i) => (
            <div key={i} className="rounded-md border border-border p-3">
              <div className="mb-2 flex items-center gap-2">
                <PlayPill kind={p.kind} side={p.side} />
                {p.size_hint_usd != null && (
                  <span className="text-xs text-muted-foreground">
                    size {usd(p.size_hint_usd)}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Leg label="Entry" value={priceCents(p.entry)} />
                <Leg label="Target" value={priceCents(p.target)} />
                <Leg label="Stop" value={priceCents(p.stop)} />
              </div>
              {p.rationale && (
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {p.rationale}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
