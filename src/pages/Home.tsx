import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { StatusStrip } from "@/components/status/StatusStrip";
import { ReconcileChip } from "@/components/status/ReconcileChip";
import { ThemeCard } from "@/components/opportunities/ThemeCard";
import {
  FilterBar,
  DEFAULT_FILTERS,
  applyFilters,
  type Filters,
} from "@/components/opportunities/FilterBar";
import { OpportunityTable } from "@/components/opportunities/OpportunityTable";
import { LoadingSkeleton, EmptyState, ErrorState } from "@/components/common/QueryStates";
import {
  useManifest,
  useOpportunities,
  useBriefing,
  useLastCycle,
  usePortfolioSnapshot,
} from "@/hooks/data";

function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function filtersFromParams(p: URLSearchParams): Filters {
  return {
    category: p.get("category") ?? DEFAULT_FILTERS.category,
    archetype: p.get("archetype") ?? DEFAULT_FILTERS.archetype,
    play: p.get("play") ?? DEFAULT_FILTERS.play,
    minScore: p.get("minScore") ?? DEFAULT_FILTERS.minScore,
    minEdge: p.get("minEdge") ?? DEFAULT_FILTERS.minEdge,
  };
}

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = filtersFromParams(searchParams);

  const manifest = useManifest();
  const date = manifest.data?.latest_date ?? todayUTC();

  const opps = useOpportunities(manifest.isLoading ? undefined : date);
  const briefing = useBriefing(manifest.isLoading ? undefined : date);
  const lastCycle = useLastCycle();
  const paper = usePortfolioSnapshot("paper");

  // The opportunities query is disabled until the manifest resolves the date —
  // treat "no data and no error yet" as loading so we show a skeleton, not the
  // empty state.
  const oppsResolved = opps.isError || opps.data !== undefined;
  const all = opps.data ?? [];
  const categories = useMemo(
    () => [...new Set(all.map((o) => o.category).filter(Boolean))].sort(),
    [all],
  );
  const filtered = useMemo(() => applyFilters(all, filters), [all, filters]);

  const updateFilters = (next: Filters) => {
    const params = new URLSearchParams();
    (Object.keys(next) as (keyof Filters)[]).forEach((k) => {
      if (next[k] !== DEFAULT_FILTERS[k]) params.set(k, next[k]);
    });
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">
            Today’s Opportunities &amp; Signal Decisions
          </h1>
          <p className="text-xs text-muted-foreground">
            Research run for {date}
          </p>
        </div>
        <ReconcileChip opportunities={all} />
      </div>

      <StatusStrip
        lastCycle={lastCycle.data}
        paper={paper.data}
        briefing={briefing.data}
      />

      {briefing.data && <ThemeCard briefing={briefing.data} />}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Opportunities
            {oppsResolved && (
              <span className="ml-1.5 tabular-nums">
                ({filtered.length}
                {filtered.length !== all.length && ` of ${all.length}`})
              </span>
            )}
          </h2>
          <FilterBar
            categories={categories}
            value={filters}
            onChange={updateFilters}
          />
        </div>

        {!oppsResolved ? (
          <LoadingSkeleton rows={6} />
        ) : opps.isError ? (
          <ErrorState
            error={opps.error}
            onRetry={() => opps.refetch()}
            empty={
              <EmptyState
                title={`No opportunities published for ${date}`}
                hint={
                  manifest.data
                    ? `The research engine's latest run is ${manifest.data.latest_date}. Today's run may not have completed yet.`
                    : "The research engine may not have run yet today."
                }
              />
            }
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            title={
              all.length === 0
                ? "No opportunities surfaced today"
                : "No opportunities match the current filters"
            }
            hint={
              all.length === 0
                ? "The research engine ran but every market scored below the threshold."
                : "Loosen or clear the filters above."
            }
          />
        ) : (
          <OpportunityTable opportunities={filtered} />
        )}
      </div>
    </div>
  );
}
