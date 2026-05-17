import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FreshnessBadge } from "@/components/status/FreshnessBadge";
import { ageMinutes } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LastCycle } from "@/types";

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="text-sm font-medium tabular-nums">{value}</div>
    </div>
  );
}

/** Last-cycle summary card (HANDOFF §4.6.A). Amber if next run is >5 min overdue. */
export function CycleCard({ cycle }: { cycle?: LastCycle }) {
  if (!cycle) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Last cycle</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No cycle data published.
        </CardContent>
      </Card>
    );
  }

  const c = cycle as LastCycle & { synthesized?: boolean; next_run_eta?: string };
  const overdue =
    c.next_run_eta != null && (ageMinutes(c.next_run_eta) ?? 0) > 5;

  return (
    <Card className={cn(overdue && "border-amber-500/40")}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Last cycle</CardTitle>
        <FreshnessBadge ts={c.generated_at} />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Markets scanned" value={c.markets_scanned ?? "—"} />
          <Stat label="Orders placed" value={c.orders_placed ?? "—"} />
          <Stat label="Orders attempted" value={c.orders_attempted ?? "—"} />
          <Stat
            label="Duration"
            value={
              c.cycle_duration_ms != null
                ? `${(c.cycle_duration_ms / 1000).toFixed(1)}s`
                : "—"
            }
          />
        </div>
        {(c.halts_triggered?.length ?? 0) > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {c.halts_triggered!.map((h) => (
              <span
                key={h}
                className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-400"
              >
                {h}
              </span>
            ))}
          </div>
        )}
        {c.synthesized && (
          <p className="text-xs text-muted-foreground">
            Synthesized — the bot doesn’t emit a cycle record yet; figures are
            best-effort from log file timestamps.
          </p>
        )}
        {overdue && (
          <p className="text-xs text-amber-400">
            Next run is overdue (ETA was {c.next_run_eta}).
          </p>
        )}
      </CardContent>
    </Card>
  );
}
