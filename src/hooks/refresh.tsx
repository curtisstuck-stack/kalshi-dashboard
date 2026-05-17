/**
 * Manual-refresh coordination (HANDOFF §5.1, tier 3).
 *
 * Hitting "Refresh" bumps a generation counter that is folded into every data
 * query key — so all active queries refetch, and once refreshed they fetch with
 * `nocache=1` to bust the 60s edge cache. Also tracks a "last fetched" time.
 */
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { useQueryClient } from "@tanstack/react-query";

interface RefreshState {
  generation: number;
  /** True once the user has manually refreshed — data fetches then bypass cache. */
  bypassCache: boolean;
  lastFetched: number | null;
  refresh: () => void;
  markFetched: () => void;
}

const RefreshContext = createContext<RefreshState | null>(null);

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [generation, setGeneration] = useState(0);
  const [lastFetched, setLastFetched] = useState<number | null>(null);
  const qc = useQueryClient();

  const refresh = useCallback(() => {
    setGeneration((g) => g + 1);
    setLastFetched(Date.now());
    void qc.invalidateQueries({ queryKey: ["data"] });
  }, [qc]);

  const markFetched = useCallback(() => setLastFetched(Date.now()), []);

  const value = useMemo<RefreshState>(
    () => ({
      generation,
      bypassCache: generation > 0,
      lastFetched,
      refresh,
      markFetched,
    }),
    [generation, lastFetched, refresh, markFetched],
  );

  return <RefreshContext.Provider value={value}>{children}</RefreshContext.Provider>;
}

export function useRefresh(): RefreshState {
  const ctx = useContext(RefreshContext);
  if (!ctx) throw new Error("useRefresh must be used within RefreshProvider");
  return ctx;
}
