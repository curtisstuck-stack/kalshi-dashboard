import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { usdSigned, dateLong } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Settlement } from "@/lib/api";

/** Settlement log (HANDOFF §4.3.E) — resolved positions and their P&L. */
export function SettlementTable({ settlements }: { settlements: Settlement[] }) {
  const rows = [...settlements]
    .sort(
      (a, b) =>
        Date.parse(b.settled_at ?? "") - Date.parse(a.settled_at ?? ""),
    )
    .slice(0, 50);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Settlement log</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState title="No settled trades" />
        ) : (
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-2 py-1.5 text-left">Settled</th>
                  <th className="px-2 py-1.5 text-left">Ticker</th>
                  <th className="px-2 py-1.5 text-left">Dir</th>
                  <th className="px-2 py-1.5 text-right">Qty</th>
                  <th className="px-2 py-1.5 text-right">P&L</th>
                  <th className="px-2 py-1.5 text-left">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((s, i) => {
                  const pnl = (s.net_pnl_cents ?? 0) / 100;
                  return (
                    <tr key={i} className="border-b border-border/50">
                      <td className="px-2 py-1.5 text-xs text-muted-foreground">
                        {dateLong(s.settled_at)}
                      </td>
                      <td className="px-2 py-1.5 font-mono text-xs">{s.ticker}</td>
                      <td className="px-2 py-1.5 uppercase">{s.direction}</td>
                      <td className="px-2 py-1.5 text-right tabular-nums">
                        {s.contracts ?? "—"}
                      </td>
                      <td
                        className={cn(
                          "px-2 py-1.5 text-right tabular-nums",
                          pnl < 0
                            ? "text-rose-400"
                            : pnl > 0
                              ? "text-emerald-400"
                              : "text-muted-foreground",
                        )}
                      >
                        {usdSigned(pnl)}
                      </td>
                      <td className="px-2 py-1.5 text-xs">
                        {s.outcome === 1 ? (
                          <span className="text-emerald-400">Win</span>
                        ) : s.outcome === -1 ? (
                          <span className="text-rose-400">Loss</span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
