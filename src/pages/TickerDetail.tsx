import { useParams } from "react-router-dom";
import { PagePlaceholder } from "@/components/layout/PagePlaceholder";

export default function TickerDetail() {
  const { ticker } = useParams();
  return (
    <PagePlaceholder
      title={`Ticker Detail — ${ticker ?? ""}`}
      phase="Phase 2"
      spec="HANDOFF §4.2 — MarketHeader, ScoreRadar, BookLadder, FairValueGauge, PlayList, DecisionTrace, ResearchLinks"
    />
  );
}
