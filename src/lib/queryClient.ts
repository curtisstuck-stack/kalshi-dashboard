import { QueryClient } from "@tanstack/react-query";

// 60s stale time per HANDOFF §1 — edge functions already cache 60s.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
