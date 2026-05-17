import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { ago } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { NtfyState } from "@/lib/api";

/** Severity tone from an NTFY alert key. */
function tone(key: string): { dot: string; label: string } {
  if (/fail|critical|error/i.test(key))
    return { dot: "bg-rose-400", label: "critical" };
  if (/storm|warn/i.test(key)) return { dot: "bg-amber-400", label: "warning" };
  if (/heartbeat|ok/i.test(key))
    return { dot: "bg-emerald-400", label: "info" };
  return { dot: "bg-sky-400", label: "info" };
}

/** NTFY alert feed (HANDOFF §4.6.D) — recent push alerts, newest first. */
export function AlertFeed({ alerts }: { alerts?: NtfyState }) {
  const rows = Object.entries(alerts ?? {})
    .map(([key, v]) => ({ key, ...v }))
    .sort((a, b) => (b.last_sent_unix ?? 0) - (a.last_sent_unix ?? 0));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">NTFY alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState title="No alerts recorded" />
        ) : (
          <ul className="space-y-2.5">
            {rows.map((a) => {
              const t = tone(a.key);
              return (
                <li key={a.key} className="flex items-start gap-2.5">
                  <span
                    className={cn("mt-1 h-2 w-2 shrink-0 rounded-full", t.dot)}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs">{a.key}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">
                        {a.last_sent_iso ? ago(a.last_sent_iso) : ""}
                      </span>
                    </div>
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                      {a.summary}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
