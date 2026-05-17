import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { timeUTC } from "@/lib/format";
import type { MmLogEvent } from "@/lib/api";

/** Event-window widener log (HANDOFF §4.4.G) — multiplier-changed events from mm_log. */
export function WidenerLog({ events }: { events: MmLogEvent[] }) {
  const widens = events
    .filter((e) => /widen/i.test(e.event))
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    .slice(0, 20);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Event-window widener</CardTitle>
      </CardHeader>
      <CardContent>
        {widens.length === 0 ? (
          <EmptyState
            title="No widener events in the log window"
            hint="The event-window widener is dormant/shadow-mode — it logs only when a scheduled event triggers a spread multiplier > 1."
          />
        ) : (
          <ol className="space-y-1.5">
            {widens.map((e, i) => (
              <li key={i} className="flex items-center gap-2 text-xs">
                <span className="w-20 shrink-0 tabular-nums text-muted-foreground">
                  {timeUTC(e.iso_time ?? e.timestamp)}
                </span>
                <span className="font-mono">{e.ticker ?? "—"}</span>
                <span className="text-muted-foreground">
                  ×{String((e as { multiplier?: number }).multiplier ?? "?")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
