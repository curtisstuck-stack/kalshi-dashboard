import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { BriefingList } from "@/components/archive/BriefingList";
import { BriefingReader } from "@/components/archive/BriefingReader";
import { HandoverViewer } from "@/components/archive/HandoverViewer";
import { ThemeDrift } from "@/components/archive/ThemeDrift";
import {
  LoadingSkeleton,
  EmptyState,
  ErrorState,
} from "@/components/common/QueryStates";
import {
  useBriefings,
  useBriefingMarkdown,
  useHandover,
  useHandoverOutcomes,
} from "@/hooks/data";
import { useRefresh } from "@/hooks/refresh";
import type { Briefing } from "@/types";

export default function ResearchArchive() {
  const { date: routeDate } = useParams();
  const navigate = useNavigate();
  const { generation } = useRefresh();

  const briefings = useBriefings();
  const dates = briefings.data?.dates ?? [];
  const selected = routeDate ?? dates[0];

  const markdown = useBriefingMarkdown(selected);
  const handover = useHandover(selected);
  const outcomes = useHandoverOutcomes(selected);

  // All briefing metadata, for the theme-drift aggregation.
  const allBriefings = useQuery({
    queryKey: ["data", "all-briefings", dates, generation],
    queryFn: () =>
      Promise.all(
        dates.map((d) =>
          api.briefing(d).catch(() => null),
        ),
      ),
    enabled: dates.length > 0,
  });
  const briefingMeta = (allBriefings.data ?? []).filter(
    (b): b is Briefing => b != null,
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">
        Research Briefings Archive
      </h1>

      {briefings.isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : briefings.isError ? (
        <ErrorState error={briefings.error} onRetry={() => briefings.refetch()} />
      ) : dates.length === 0 ? (
        <EmptyState title="No briefings have been published yet" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-card p-2">
              <BriefingList
                dates={dates}
                selected={selected}
                onSelect={(d) => navigate(`/archive/${d}`)}
              />
            </div>
            <ThemeDrift briefings={briefingMeta} />
          </div>

          <div className="space-y-4">
            {markdown.isLoading ? (
              <LoadingSkeleton rows={10} />
            ) : markdown.isError ? (
              <ErrorState
                error={markdown.error}
                onRetry={() => markdown.refetch()}
                empty={<EmptyState title={`No briefing text for ${selected}`} />}
              />
            ) : (
              <BriefingReader markdown={markdown.data ?? ""} />
            )}
            <HandoverViewer
              handover={handover.data}
              outcomesMd={outcomes.data}
            />
          </div>
        </div>
      )}
    </div>
  );
}
