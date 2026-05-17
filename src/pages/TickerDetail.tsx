import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarketHeader } from "@/components/ticker/MarketHeader";
import { ScoreRadar } from "@/components/ticker/ScoreRadar";
import { FairValueGauge } from "@/components/ticker/FairValueGauge";
import { BookLadder } from "@/components/ticker/BookLadder";
import { PlayList } from "@/components/ticker/PlayList";
import { DecisionTrace } from "@/components/ticker/DecisionTrace";
import { ResearchLinks } from "@/components/ticker/ResearchLinks";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/common/QueryStates";
import {
  useManifest,
  useOpportunities,
  useSnapshot,
  useResearchCache,
  useMmLog,
} from "@/hooks/data";

export default function TickerDetail() {
  const { ticker = "" } = useParams();
  const navigate = useNavigate();

  const manifest = useManifest();
  const date = manifest.data?.latest_date;
  const opps = useOpportunities(date);
  const snapshot = useSnapshot(date);
  const research = useResearchCache(date);
  const mmLog = useMmLog();

  const opp = opps.data?.find((o) => o.ticker === ticker);
  const market = snapshot.data?.markets.find((m) => m.ticker === ticker);

  const back = (
    <Button variant="ghost" size="sm" className="-ml-2" onClick={() => navigate(-1)}>
      <ArrowLeft className="mr-1.5 h-4 w-4" />
      Back
    </Button>
  );

  // opportunities is disabled until the manifest resolves the date.
  const oppsResolved = opps.isError || opps.data !== undefined;
  if (manifest.isLoading || !oppsResolved) {
    return (
      <div className="space-y-4">
        {back}
        <LoadingSkeleton rows={8} />
      </div>
    );
  }

  if (opps.isError) {
    return (
      <div className="space-y-4">
        {back}
        <ErrorState error={opps.error} onRetry={() => opps.refetch()} />
      </div>
    );
  }

  if (!opp) {
    return (
      <div className="space-y-4">
        {back}
        <EmptyState
          title={`Market ${ticker} not found`}
          hint={`It isn't in the opportunities for ${date ?? "the latest run"}. It may have closed or fallen below the scoring threshold.`}
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {back}
      <MarketHeader opp={opp} />

      <div className="grid gap-4 lg:grid-cols-2">
        <ScoreRadar opp={opp} />
        <FairValueGauge opp={opp} />
        <BookLadder market={market} />
        <PlayList plays={opp.plays} />
        <DecisionTrace events={mmLog.data ?? []} ticker={ticker} />
        <ResearchLinks
          articles={research.data?.articles ?? []}
          ticker={ticker}
          category={opp.category}
        />
      </div>
    </div>
  );
}
