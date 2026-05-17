/**
 * React Query data hooks. Every hook folds the refresh `generation` into its
 * key so the global Refresh button refetches it; `bypassCache` routes through
 * the edge function with `nocache=1`.
 */
import { useQuery } from "@tanstack/react-query";
import { api, NotFoundError } from "@/lib/api";
import { useRefresh } from "./refresh";

function useGen() {
  const { generation, bypassCache } = useRefresh();
  return { generation, nocache: bypassCache };
}

/** Don't retry a genuine 404 — the file simply isn't there yet. */
const retryNon404 = (count: number, err: unknown) =>
  !(err instanceof NotFoundError) && count < 1;

export function useManifest() {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "manifest", generation],
    queryFn: () => api.manifest({ nocache }),
  });
}

export function useOpportunities(date: string | undefined) {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "opportunities", date, generation],
    queryFn: () => api.opportunities(date!, { nocache }),
    enabled: !!date,
    retry: retryNon404,
  });
}

export function useBriefing(date: string | undefined) {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "briefing", date, generation],
    queryFn: () => api.briefing(date!, { nocache }),
    enabled: !!date,
    retry: retryNon404,
  });
}

export function useHandover(date: string | undefined) {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "handover", date, generation],
    queryFn: () => api.handover(date!, { nocache }),
    enabled: !!date,
    retry: retryNon404,
  });
}

export function useLastCycle() {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "last-cycle", generation],
    queryFn: () => api.lastCycle({ nocache }),
    retry: retryNon404,
  });
}

export function usePortfolioSnapshot(mode: "paper" | "live") {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "portfolio-snapshot", mode, generation],
    queryFn: () => api.portfolioSnapshot(mode, { nocache }),
    retry: retryNon404,
  });
}

export function useSnapshot(date: string | undefined) {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "snapshot", date, generation],
    queryFn: () => api.snapshot(date!, { nocache }),
    enabled: !!date,
    retry: retryNon404,
  });
}

export function useResearchCache(date: string | undefined) {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "research-cache", date, generation],
    queryFn: () => api.researchCache(date!, { nocache }),
    enabled: !!date,
    retry: retryNon404,
  });
}

export function usePnlHistory(mode: "paper" | "live") {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "pnl-history", mode, generation],
    queryFn: () => api.pnlHistory(mode, { nocache }),
    retry: retryNon404,
  });
}

export function useFills() {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "fills", generation],
    queryFn: () => api.fills({ nocache }),
    retry: retryNon404,
  });
}

export function useSettlements() {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "settlements", generation],
    queryFn: () => api.settlements({ nocache }),
    retry: retryNon404,
  });
}

export function useMmLog() {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "mm-log", generation],
    queryFn: () => api.mmLog({ nocache }),
    retry: retryNon404,
  });
}
