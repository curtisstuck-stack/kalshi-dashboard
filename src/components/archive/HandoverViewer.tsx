import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { parseOutcomes, OUTCOME_TONE } from "@/lib/handover";
import { cn } from "@/lib/utils";
import type { Handover } from "@/types";

const PRIORITY_TONE: Record<string, string> = {
  P0: "bg-rose-500/15 text-rose-400",
  P1: "bg-amber-500/15 text-amber-400",
  P2: "bg-sky-500/15 text-sky-400",
};

/** Handover items with landed/deferred status (HANDOFF §4.5.C). */
export function HandoverViewer({
  handover,
  outcomesMd,
}: {
  handover?: Handover;
  outcomesMd?: string;
}) {
  const outcomes = parseOutcomes(outcomesMd ?? "");
  const items = handover?.items ?? [];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          Handover items
          {handover?.date && (
            <span className="ml-1.5 font-normal text-muted-foreground">
              {handover.date}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState title="No handover items for this date" />
        ) : (
          <ul className="space-y-2">
            {items.map((it) => {
              const o = outcomes[it.id];
              return (
                <li
                  key={it.id}
                  className="rounded-md border border-border p-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "rounded px-1 py-0.5 text-[10px] font-medium",
                            PRIORITY_TONE[it.priority] ??
                              "bg-muted text-muted-foreground",
                          )}
                        >
                          {it.priority}
                        </span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {it.id}
                        </span>
                      </div>
                      <div className="mt-1 text-sm">{it.title}</div>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium",
                        o
                          ? OUTCOME_TONE[o.status]
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {o?.status ?? "PENDING"}
                    </span>
                  </div>
                  {o?.note && (
                    <p className="mt-1.5 text-xs text-muted-foreground">{o.note}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
