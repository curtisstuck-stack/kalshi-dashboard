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

export function useHandoverOutcomes(date: string | undefined) {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "handover-outcomes", date, generation],
    queryFn: () => api.handoverOutcomes(date!, { nocache }),
    enabled: !!date,
    retry: retryNon404,
  });
}

export function useBriefings() {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "briefings-index", generation],
    queryFn: () => api.briefingsIndex({ nocache }),
    retry: retryNon404,
  });
}

export function useBriefingMarkdown(date: string | undefined) {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "briefing-md", date, generation],
    queryFn: () => api.briefingMarkdown(date!, { nocache }),
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

export function useHalts() {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "halts", generation],
    queryFn: () => api.halts({ nocache }),
    retry: retryNon404,
  });
}

/** Combined signals data for the Signal Explorer (HANDOFF §4.4). */
export function useSignals() {
  const { generation, nocache } = useGen();
  const weights = useQuery({
    queryKey: ["data", "signal-weights", generation],
    queryFn: () => api.signalWeights({ nocache }),
    retry: retryNon404,
  });
  const accuracy = useQuery({
    queryKey: ["data", "signal-accuracy", generation],
    queryFn: () => api.signalAccuracy({ nocache }),
    retry: retryNon404,
  });
  const calibration = useQuery({
    queryKey: ["data", "signal-calibration", generation],
    queryFn: () => api.signalCalibration({ nocache }),
    retry: retryNon404,
  });
  const recommendations = useQuery({
    queryKey: ["data", "signal-recommendations", generation],
    queryFn: () => api.signalRecommendations({ nocache }),
    retry: retryNon404,
  });
  const reliability = useQuery({
    queryKey: ["data", "signal-reliability", generation],
    queryFn: () => api.signalReliability({ nocache }),
    retry: retryNon404,
  });
  return { weights, accuracy, calibration, recommendations, reliability };
}

export function useAlerts() {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "alerts", generation],
    queryFn: () => api.alerts({ nocache }),
    retry: retryNon404,
  });
}

export function useCronLog() {
  const { generation, nocache } = useGen();
  return useQuery({
    queryKey: ["data", "cron", generation],
    queryFn: () => api.cron({ nocache }),
    retry: retryNon404,
  });
}
