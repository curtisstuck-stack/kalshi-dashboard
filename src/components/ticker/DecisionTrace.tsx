import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { timeUTC } from "@/lib/format";
import type { MmLogEvent } from "@/lib/api";

/** Color a bot log event by its outcome. */
function tone(event: string): string {
  if (/post|placed|fill/i.test(event)) return "bg-emerald-400";
  if (/cancel|block|halt|reject|stale/i.test(event)) return "bg-amber-400";
  return "bg-muted-foreground";
}

/** Bot decision trace for a ticker (HANDOFF §4.2.F) — from health/mm_log.jsonl. */
export function DecisionTrace({
  events,
  ticker,
}: {
  events: MmLogEvent[];
  ticker: string;
}) {
  const mine = events
    .filter((e) => e.ticker === ticker)
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    .slice(0, 30);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Bot decision trace</CardTitle>
      </CardHeader>
      <CardContent>
        {mine.length === 0 ? (
          <EmptyState
            title="No bot decisions for this market"
            hint="The bot hasn't quoted or evaluated this ticker in the captured log window."
          />
        ) : (
          <ol className="space-y-2">
            {mine.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span
                  className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${tone(e.event)}`}
                />
                <span className="w-20 shrink-0 tabular-nums text-muted-foreground">
                  {timeUTC(e.iso_time ?? e.timestamp)}
                </span>
                <span className="font-mono">{e.event}</span>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
}
