import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { priceCents, usdSigned, ago } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PortfolioSnapshot } from "@/types";
import type { PortfolioMode } from "./KPICards";

type Pos = NonNullable<PortfolioSnapshot["open_positions"]>[number] & {
  mode?: string;
};

/** Open positions across paper/live (HANDOFF §4.3.C). */
export function OpenPositionsTable({
  paper,
  live,
  mode,
}: {
  paper?: PortfolioSnapshot;
  live?: PortfolioSnapshot;
  mode: PortfolioMode;
}) {
  const rows: Pos[] = [];
  if (mode !== "live")
    rows.push(...(paper?.open_positions ?? []).map((p) => ({ ...p, mode: "paper" })));
  if (mode !== "paper")
    rows.push(...(live?.open_positions ?? []).map((p) => ({ ...p, mode: "live" })));

  const showMode = mode === "both";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Open positions</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState
            title="No open positions"
            hint="The bot is balance-floored and holding no positions."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  {showMode && <th className="px-2 py-1.5 text-left">Mode</th>}
                  <th className="px-2 py-1.5 text-left">Ticker</th>
                  <th className="px-2 py-1.5 text-left">Side</th>
                  <th className="px-2 py-1.5 text-right">Qty</th>
                  <th className="px-2 py-1.5 text-right">Avg</th>
                  <th className="px-2 py-1.5 text-right">Mid</th>
                  <th className="px-2 py-1.5 text-right">UPL</th>
                  <th className="px-2 py-1.5 text-right">Held</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {showMode && (
                      <td className="px-2 py-1.5 text-xs text-muted-foreground">
                        {p.mode}
                      </td>
                    )}
                    <td className="px-2 py-1.5 font-mono text-xs">{p.ticker}</td>
                    <td className="px-2 py-1.5 uppercase">{p.side}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{p.qty}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {priceCents(p.avg_price)}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {priceCents(p.current_mid)}
                    </td>
                    <td
                      className={cn(
                        "px-2 py-1.5 text-right tabular-nums",
                        (p.unrealized_pnl_usd ?? 0) < 0
                          ? "text-rose-400"
                          : "text-emerald-400",
                      )}
                    >
                      {p.unrealized_pnl_usd != null
                        ? usdSigned(p.unrealized_pnl_usd)
                        : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right text-xs text-muted-foreground">
                      {p.opened_at ? ago(p.opened_at) : "—"}
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
