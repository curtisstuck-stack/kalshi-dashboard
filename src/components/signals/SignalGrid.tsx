import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { pct, ago } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { SignalAccuracy, SignalWeights } from "@/types";

interface Props {
  accuracy?: SignalAccuracy;
  weights?: SignalWeights;
}

/** Signal registry (HANDOFF §4.4.A) — one card per known signal. */
export function SignalGrid({ accuracy, weights }: Props) {
  const acc = (accuracy ?? {}) as Record<
    string,
    { accuracy?: number; total_calls?: number; correct_calls?: number; last_updated?: string }
  >;
  const wts = (weights?.signals ?? {}) as Record<
    string,
    { enabled?: boolean; weight?: number }
  >;
  const names = [...new Set([...Object.keys(acc), ...Object.keys(wts)])].sort();

  if (names.length === 0) {
    return (
      <EmptyState
        title="No signals have logged activity yet"
        hint="Signal accuracy is recorded once the bot resumes evaluating markets."
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {names.map((name) => {
        const a = acc[name] ?? {};
        const w = wts[name];
        return (
          <Card key={name} className="space-y-2 p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-sm">{name}</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-medium",
                  w?.enabled === false
                    ? "bg-muted text-muted-foreground"
                    : "bg-emerald-500/15 text-emerald-400",
                )}
              >
                {w?.enabled === false ? "disabled" : "enabled"}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <Stat label="Accuracy" value={a.accuracy != null ? pct(a.accuracy, 0) : "—"} />
              <Stat label="Calls" value={a.total_calls != null ? String(a.total_calls) : "—"} />
              <Stat label="Weight" value={w?.weight != null ? w.weight.toFixed(2) : "1.00"} />
            </div>
            <div className="text-[11px] text-muted-foreground">
              {a.last_updated ? `updated ${ago(a.last_updated)}` : "no recent activity"}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="tabular-nums">{value}</div>
    </div>
  );
}
