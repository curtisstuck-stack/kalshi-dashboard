/**
 * ArbGap — Phase 1.6 dashboard panel.
 *
 * Three sections:
 *   1. Pending review queue   (arb/candidates.jsonl, status=pending)
 *   2. Approved mappings      (arb/approved.jsonl)
 *   3. Recent scanner events  (arb/events.jsonl, last N)
 *
 * Read-only. Approvals are done with the Python CLI:
 *   uv run python -m arb_engine.cli.review_mappings approve <PAIR_ID>
 * which writes a new line to arb/approved.jsonl and the cron pusher ships
 * it to the data repo on the next 15-min tick.
 */
import { useQuery } from "@tanstack/react-query";
import {
  api,
  type ArbCandidate,
  type ArbLegEvent,
  NotFoundError,
} from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EmptyState, LoadingSkeleton } from "@/components/common/QueryStates";
import { Badge } from "@/components/ui/badge";

export default function ArbGap() {
  return (
    <div className="space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">ArbGap</h1>
        <p className="text-sm text-muted-foreground">
          Cross-venue arb pipeline: candidate mappings, approved pairs, and
          live scanner P&amp;L.
        </p>
      </header>

      <PendingQueue />
      <ApprovedList />
      <EventsLog />
    </div>
  );
}

// ---------- pending queue --------------------------------------------------

function PendingQueue() {
  const q = useQuery({
    queryKey: ["arb", "candidates"],
    queryFn: () => api.arbCandidates(),
    retry: (_n, err) => !(err instanceof NotFoundError),
  });

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">
          Pending review queue{" "}
          {q.data && (
            <span className="text-muted-foreground font-normal">
              ({q.data.filter((c) => c.status === "pending").length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {q.isLoading && <LoadingSkeleton rows={3} />}
        {q.error instanceof NotFoundError && (
          <EmptyState
            title="No candidates yet"
            hint="Run `uv run python -m arb_engine.cli.map_markets --scorer anthropic` then push arb/candidates.jsonl to the data repo."
          />
        )}
        {q.data && q.data.filter((c) => c.status === "pending").length === 0 && (
          <EmptyState
            title="All caught up"
            hint="Every candidate has been reviewed."
          />
        )}
        {q.data && (
          <ul className="space-y-3">
            {q.data
              .filter((c) => c.status === "pending")
              .slice(0, 25)
              .map((c) => (
                <CandidateRow key={candidateKey(c)} c={c} />
              ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

function candidateKey(c: ArbCandidate): string {
  return `${c.pm.market_id}::${c.kalshi.market_id}`;
}

function CandidateRow({ c }: { c: ArbCandidate }) {
  const conf = (c.score.confidence * 100).toFixed(1);
  const conv = (c.prefilter_score * 100).toFixed(0);
  const tone = c.score.confidence >= 0.85
    ? "bg-green-500/20 text-green-200"
    : c.score.confidence >= 0.65
      ? "bg-amber-500/20 text-amber-200"
      : "bg-red-500/20 text-red-200";

  return (
    <li className="rounded-md border border-border/40 bg-secondary/20 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0 flex-1">
          <div className="text-sm font-medium truncate" title={c.pm.title}>
            PM&nbsp;· {c.pm.title}
          </div>
          <div className="text-sm text-muted-foreground truncate" title={c.kalshi.title}>
            KX&nbsp;· {c.kalshi.title}{" "}
            <span className="text-xs">({c.kalshi.market_id})</span>
          </div>
          {c.score.notes && (
            <div className="text-xs text-muted-foreground/80 line-clamp-2">
              {c.score.notes}
            </div>
          )}
          {c.score.risks.length > 0 && (
            <div className="text-xs text-amber-300/80 line-clamp-2">
              ⚠ {c.score.risks.join("; ")}
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Badge className={tone}>{conf}% conf</Badge>
          <span className="text-[10px] text-muted-foreground">
            prefilter {conv}
            {c.score.inverted && " · inverted"}
          </span>
          <code className="text-[10px] text-muted-foreground">
            approve {pairIdHint(c)}
          </code>
        </div>
      </div>
    </li>
  );
}

function pairIdHint(c: ArbCandidate): string {
  // Suggested pair_id when the user runs the CLI.
  const k = c.kalshi.market_id.slice(0, 24);
  return `${k}::${c.pm.market_id.slice(0, 10)}`;
}

// ---------- approved list --------------------------------------------------

function ApprovedList() {
  const q = useQuery({
    queryKey: ["arb", "approved"],
    queryFn: () => api.arbApproved(),
    retry: (_n, err) => !(err instanceof NotFoundError),
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          Approved mappings{" "}
          {q.data && (
            <span className="text-muted-foreground font-normal">
              ({q.data.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {q.isLoading && <LoadingSkeleton rows={2} />}
        {q.error instanceof NotFoundError && (
          <EmptyState
            title="No approved mappings"
            hint="Approve pending candidates with the review CLI to feed the scanner."
          />
        )}
        {q.data && q.data.length === 0 && (
          <EmptyState title="No approved mappings yet" />
        )}
        {q.data && q.data.length > 0 && (
          <ul className="space-y-1">
            {q.data.map((m) => (
              <li
                key={m.pair_id}
                className="rounded border border-border/30 px-2 py-1 text-xs"
              >
                <code className="text-muted-foreground">{m.pair_id}</code>{" "}
                <span className="text-foreground">KX={m.kalshi_ticker}</span>{" "}
                <span className="text-muted-foreground">
                  PM={m.pm_condition_id.slice(0, 10)}…
                  {m.inverted && " · inverted"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ---------- scanner events log --------------------------------------------

function EventsLog() {
  const q = useQuery({
    queryKey: ["arb", "events"],
    queryFn: () => api.arbEvents(),
    retry: (_n, err) => !(err instanceof NotFoundError),
    refetchInterval: 15_000, // scanner emits roughly every 2s; pusher cron is 15m
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">
          Live arb events{" "}
          {q.data && (
            <span className="text-muted-foreground font-normal">
              (last {Math.min(q.data.length, 50)} of {q.data.length})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {q.isLoading && <LoadingSkeleton rows={3} />}
        {q.error instanceof NotFoundError && (
          <EmptyState
            title="Scanner hasn't logged any arbs yet"
            hint="Approve at least one mapping and start the scanner: `uv run python -m arb_engine.cli.scan_arb`."
          />
        )}
        {q.data && q.data.length === 0 && (
          <EmptyState title="No events yet" />
        )}
        {q.data && q.data.length > 0 && (
          <table className="w-full text-xs">
            <thead className="text-muted-foreground border-b border-border/30">
              <tr>
                <th className="text-left pb-1">time</th>
                <th className="text-left pb-1">pair</th>
                <th className="text-left pb-1">leg</th>
                <th className="text-left pb-1">venue/side</th>
                <th className="text-right pb-1">price</th>
                <th className="text-right pb-1">size</th>
                <th className="text-right pb-1">edge bps</th>
              </tr>
            </thead>
            <tbody>
              {q.data
                .slice(-50)
                .reverse()
                .map((e) => (
                  <ArbEventRow key={e.event_id} e={e} />
                ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </Card>
  );
}

function ArbEventRow({ e }: { e: ArbLegEvent }) {
  const t = new Date(e.ts).toLocaleTimeString();
  const ev = e.event;
  return (
    <tr className="border-b border-border/10">
      <td className="py-1 text-muted-foreground">{t}</td>
      <td className="py-1"><code>{ev.pair_id}</code></td>
      <td className="py-1">{ev.leg}</td>
      <td className="py-1">
        <span className="text-muted-foreground">{ev.venue}</span>·
        <span className={ev.side === "yes" ? "text-green-300" : "text-red-300"}>
          {ev.side}
        </span>
      </td>
      <td className="py-1 text-right font-mono">{ev.price.toFixed(3)}</td>
      <td className="py-1 text-right font-mono">{ev.size.toFixed(0)}</td>
      <td className="py-1 text-right font-mono">
        {ev.expected_edge_bps.toFixed(0)}
      </td>
    </tr>
  );
}
