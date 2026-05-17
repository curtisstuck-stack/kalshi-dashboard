import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { priceCents, num } from "@/lib/format";
import type { SnapshotMarket } from "@/lib/api";

interface Level {
  price: number;
  size: number;
}

/** Best-effort parse of a Kalshi-style orderbook into YES / NO level arrays. */
function parseBook(ob: unknown): { yes: Level[]; no: Level[] } | null {
  if (!ob || typeof ob !== "object") return null;
  const o = ob as Record<string, unknown>;
  const toLevels = (raw: unknown): Level[] =>
    Array.isArray(raw)
      ? raw
          .map((r) =>
            Array.isArray(r) ? { price: Number(r[0]), size: Number(r[1]) } : null,
          )
          .filter((l): l is Level => !!l && !Number.isNaN(l.price))
          .slice(0, 5)
      : [];
  const yes = toLevels(o.yes);
  const no = toLevels(o.no);
  return yes.length || no.length ? { yes, no } : null;
}

/** Order-book ladder (HANDOFF §4.2.C). Falls back to best bid/ask, then empty. */
export function BookLadder({ market }: { market?: SnapshotMarket }) {
  const book = parseBook(market?.orderbook);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Order book</CardTitle>
      </CardHeader>
      <CardContent>
        {book ? (
          <div className="grid grid-cols-2 gap-4">
            <Side title="YES" levels={book.yes} tone="text-emerald-400" />
            <Side title="NO" levels={book.no} tone="text-rose-400" />
          </div>
        ) : market && (market.yes_bid != null || market.yes_ask != null) ? (
          <div className="space-y-1.5 text-sm">
            <Row label="YES ask" value={priceCents(market.yes_ask)} tone="text-rose-400" />
            <Row label="YES bid" value={priceCents(market.yes_bid)} tone="text-emerald-400" />
            {market.last_price != null && (
              <Row
                label="Last"
                value={priceCents(market.last_price)}
                tone="text-muted-foreground"
              />
            )}
            <p className="pt-1 text-xs text-muted-foreground">
              Full depth not captured in this snapshot — showing top of book.
            </p>
          </div>
        ) : (
          <EmptyState title="No book data for this market" />
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={`tabular-nums ${tone}`}>{value}</span>
    </div>
  );
}

function Side({
  title,
  levels,
  tone,
}: {
  title: string;
  levels: Level[];
  tone: string;
}) {
  return (
    <div>
      <div className={`mb-1 text-xs font-medium ${tone}`}>{title}</div>
      {levels.length === 0 ? (
        <div className="text-xs text-muted-foreground">—</div>
      ) : (
        <div className="space-y-1">
          {levels.map((l, i) => (
            <div key={i} className="flex justify-between text-xs tabular-nums">
              <span>{priceCents(l.price)}</span>
              <span className="text-muted-foreground">{num(l.size, 0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
