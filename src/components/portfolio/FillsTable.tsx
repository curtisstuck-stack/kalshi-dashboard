import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { timeUTC, dateLong } from "@/lib/format";
import type { Fill } from "@/lib/api";

/** Recent simulated fills (HANDOFF §4.3.D) — newest 50. */
export function FillsTable({ fills }: { fills: Fill[] }) {
  const rows = [...fills]
    .sort((a, b) => (b.timestamp ?? 0) - (a.timestamp ?? 0))
    .slice(0, 50);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Recent fills</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <EmptyState title="No fills recorded" />
        ) : (
          <div className="max-h-80 overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-card text-xs text-muted-foreground">
                <tr className="border-b border-border">
                  <th className="px-2 py-1.5 text-left">When</th>
                  <th className="px-2 py-1.5 text-left">Ticker</th>
                  <th className="px-2 py-1.5 text-left">Side</th>
                  <th className="px-2 py-1.5 text-right">Qty</th>
                  <th className="px-2 py-1.5 text-right">Price</th>
                  <th className="px-2 py-1.5 text-left">Signal</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((f, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td
                      className="px-2 py-1.5 text-xs text-muted-foreground"
                      title={dateLong(f.iso_time)}
                    >
                      {timeUTC(f.iso_time ?? f.timestamp)}
                    </td>
                    <td className="px-2 py-1.5 font-mono text-xs">{f.ticker}</td>
                    <td className="px-2 py-1.5 uppercase">{f.side}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {f.contracts ?? "—"}
                    </td>
                    <td className="px-2 py-1.5 text-right tabular-nums">
                      {f.entry_price != null ? `${f.entry_price}¢` : "—"}
                    </td>
                    <td className="px-2 py-1.5 text-xs text-muted-foreground">
                      {f.signal_source ?? "—"}
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
