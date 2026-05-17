import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { ago } from "@/lib/format";
import type { CronSnapshot } from "@/lib/api";

/** Cron / timer history (HANDOFF §4.6.C). */
export function CronTimeline({ cron }: { cron?: CronSnapshot }) {
  const jobs = cron?.jobs ?? [];
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Scheduled jobs</CardTitle>
      </CardHeader>
      <CardContent>
        {jobs.length === 0 ? (
          <EmptyState title="No scheduled-job data" />
        ) : (
          <ul className="space-y-2">
            {jobs.map((j) => (
              <li
                key={j.name}
                className="flex items-center gap-3 rounded-md border border-border p-2.5"
              >
                {j.ok ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="h-4 w-4 shrink-0 text-rose-400" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-sm">{j.name}</div>
                  <div className="text-xs text-muted-foreground">{j.schedule}</div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                  {j.last_run ? `ran ${ago(j.last_run)}` : "never"}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
