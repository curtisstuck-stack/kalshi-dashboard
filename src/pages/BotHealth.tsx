import { CycleCard } from "@/components/health/CycleCard";
import { HaltsTable } from "@/components/health/HaltsTable";
import { CronTimeline } from "@/components/health/CronTimeline";
import { AlertFeed } from "@/components/health/AlertFeed";
import { LoadingSkeleton, ErrorState } from "@/components/common/QueryStates";
import { useLastCycle, useHalts, useCronLog, useAlerts } from "@/hooks/data";

export default function BotHealth() {
  const lastCycle = useLastCycle();
  const halts = useHalts();
  const cron = useCronLog();
  const alerts = useAlerts();

  const haltsResolved = halts.isError || halts.data !== undefined;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold tracking-tight">Bot Health</h1>

      <CycleCard cycle={lastCycle.data} />

      {!haltsResolved ? (
        <LoadingSkeleton rows={6} />
      ) : halts.isError ? (
        <ErrorState error={halts.error} onRetry={() => halts.refetch()} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          <HaltsTable halts={halts.data ?? []} />
          <div className="space-y-4">
            <CronTimeline cron={cron.data} />
            <AlertFeed alerts={alerts.data} />
          </div>
        </div>
      )}
    </div>
  );
}
