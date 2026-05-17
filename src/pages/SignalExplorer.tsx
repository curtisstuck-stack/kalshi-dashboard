import { SignalGrid } from "@/components/signals/SignalGrid";
import { ReliabilityDiagram } from "@/components/signals/ReliabilityDiagram";
import { WeightDiffPanel } from "@/components/signals/WeightDiffPanel";
import { ArchetypePie } from "@/components/signals/ArchetypePie";
import { RegimeBadge } from "@/components/signals/RegimeBadge";
import { ArbGapTable } from "@/components/signals/ArbGapTable";
import { WidenerLog } from "@/components/signals/WidenerLog";
import { LoadingSkeleton } from "@/components/common/QueryStates";
import {
  useSignals,
  useManifest,
  useOpportunities,
  useMmLog,
} from "@/hooks/data";

export default function SignalExplorer() {
  const { weights, accuracy, calibration, recommendations, reliability } =
    useSignals();
  const manifest = useManifest();
  const date =
    manifest.data?.latest_nonempty_date ?? manifest.data?.latest_date;
  const opps = useOpportunities(date);
  const mmLog = useMmLog();

  const loading =
    accuracy.isLoading && reliability.isLoading && recommendations.isLoading;

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold tracking-tight">
        Signal Logic Explorer
      </h1>

      {loading ? (
        <LoadingSkeleton rows={8} />
      ) : (
        <>
          <section className="space-y-2">
            <h2 className="text-sm font-medium text-muted-foreground">
              Signal registry
            </h2>
            <SignalGrid accuracy={accuracy.data} weights={weights.data} />
          </section>

          <div className="grid gap-4 lg:grid-cols-2">
            <ReliabilityDiagram buckets={reliability.data} />
            <WeightDiffPanel
              weights={weights.data}
              recommendations={recommendations.data}
            />
            <ArchetypePie opportunities={opps.data ?? []} />
            <RegimeBadge />
            <ArbGapTable />
            <WidenerLog events={mmLog.data ?? []} />
          </div>

          {calibration.data && (
            <p className="text-xs text-muted-foreground">
              Calibration: {calibration.data.method} fit, Brier{" "}
              {calibration.data.brier_before?.toFixed(3) ?? "—"} →{" "}
              {calibration.data.brier_after?.toFixed(3) ?? "—"} after.
            </p>
          )}
        </>
      )}
    </div>
  );
}
