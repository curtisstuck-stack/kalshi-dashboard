import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/QueryStates";
import { timeUTC, dateLong } from "@/lib/format";
import type { HaltEvent } from "@/types";

const PAGE = 20;

/** Recent halts (HANDOFF §4.6.B) — paginated, newest first. */
export function HaltsTable({ halts }: { halts: HaltEvent[] }) {
  const [page, setPage] = useState(0);
  const sorted = [...halts].sort(
    (a, b) => (Number(b.ts) || 0) - (Number(a.ts) || 0),
  );
  const pages = Math.max(1, Math.ceil(sorted.length / PAGE));
  const rows = sorted.slice(page * PAGE, page * PAGE + PAGE);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm">Recent halts</CardTitle>
        {sorted.length > PAGE && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              disabled={page === 0}
              onClick={() => setPage((p) => p - 1)}
            >
              Prev
            </Button>
            <span>
              {page + 1}/{pages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              disabled={page >= pages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {sorted.length === 0 ? (
          <EmptyState title="No halts recorded" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-2 py-1.5 text-left">When</th>
                  <th className="px-2 py-1.5 text-left">Reason</th>
                  <th className="px-2 py-1.5 text-left">Ticker</th>
                  <th className="px-2 py-1.5 text-left">Severity</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((h, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td
                      className="px-2 py-1.5 text-xs text-muted-foreground"
                      title={dateLong(h.iso_time)}
                    >
                      {timeUTC(h.iso_time ?? h.ts)}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-xs">{h.reason}</td>
                    <td className="px-2 py-1.5 font-mono text-xs">
                      {h.ticker ?? "—"}
                    </td>
                    <td className="px-2 py-1.5">
                      <span className="rounded bg-amber-500/15 px-1.5 py-0.5 text-xs text-amber-400">
                        {h.severity ?? h.status ?? "block"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
