import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { priceCents, num, countdown } from "@/lib/format";
import { scoreTone, edgeLabel, edgeColor } from "@/lib/scoring";
import { categoryTone } from "@/lib/archetypes";
import { cn } from "@/lib/utils";
import { PlayPill } from "./PlayPill";
import { BotStatusPill } from "./BotStatusPill";
import type { Opportunity } from "@/types";

function topPlay(o: Opportunity) {
  return o.plays?.[0];
}

const columns: ColumnDef<Opportunity>[] = [
  {
    accessorKey: "ticker",
    header: "Market",
    cell: ({ row }) => (
      <div className="max-w-[280px]">
        <div className="font-mono text-xs text-foreground">{row.original.ticker}</div>
        <div className="truncate text-xs text-muted-foreground">
          {row.original.title}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "category",
    header: "Category",
    cell: ({ getValue }) => {
      const c = getValue<string>();
      return (
        <span className={cn("rounded px-1.5 py-0.5 text-xs", categoryTone(c))}>
          {c}
        </span>
      );
    },
  },
  {
    accessorKey: "mid",
    header: "Mid",
    cell: ({ getValue }) => (
      <span className="tabular-nums">{priceCents(getValue<number>())}</span>
    ),
  },
  {
    accessorKey: "spread",
    header: "Spread",
    cell: ({ getValue }) => (
      <span className="tabular-nums text-muted-foreground">
        {priceCents(getValue<number>())}
      </span>
    ),
  },
  {
    accessorKey: "score",
    header: "Score",
    cell: ({ getValue }) => {
      const s = getValue<number>();
      return (
        <span
          className={cn(
            "rounded px-1.5 py-0.5 text-xs font-semibold tabular-nums",
            scoreTone(s),
          )}
        >
          {num(s, 3)}
        </span>
      );
    },
  },
  {
    accessorKey: "edge",
    header: "Edge",
    cell: ({ getValue }) => {
      const e = edgeLabel(getValue<number | null>());
      return <span className={cn("tabular-nums", edgeColor(e.sign))}>{e.text}</span>;
    },
    sortUndefined: "last",
  },
  {
    id: "ttc",
    accessorFn: (o) => o.hours_to_close ?? Number.POSITIVE_INFINITY,
    header: "Closes",
    cell: ({ row }) => (
      <span className="tabular-nums text-muted-foreground">
        {countdown(row.original.hours_to_close)}
      </span>
    ),
  },
  {
    id: "play",
    header: "Play",
    enableSorting: false,
    cell: ({ row }) => {
      const p = topPlay(row.original);
      return p ? <PlayPill kind={p.kind} side={p.side} /> : <span className="text-xs text-muted-foreground">—</span>;
    },
  },
  {
    id: "bot",
    header: "Bot did",
    enableSorting: false,
    cell: ({ row }) => <BotStatusPill action={row.original.bot_action} />,
  },
];

/** Sortable opportunity table (HANDOFF §4.1.B). Collapses to cards under 768px. */
export function OpportunityTable({ opportunities }: { opportunities: Opportunity[] }) {
  const navigate = useNavigate();
  const [sorting, setSorting] = useState<SortingState>([{ id: "score", desc: true }]);

  const table = useReactTable({
    data: opportunities,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const go = (ticker: string) => navigate(`/ticker/${encodeURIComponent(ticker)}`);
  const rows = table.getRowModel().rows;

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50">
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id}>
                {hg.headers.map((h) => {
                  const sortable = h.column.getCanSort();
                  const dir = h.column.getIsSorted();
                  return (
                    <th
                      key={h.id}
                      className={cn(
                        "px-3 py-2 text-left text-xs font-medium text-muted-foreground",
                        sortable && "cursor-pointer select-none hover:text-foreground",
                      )}
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      <span className="inline-flex items-center gap-1">
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {sortable &&
                          (dir === "asc" ? (
                            <ArrowUp className="h-3 w-3" />
                          ) : dir === "desc" ? (
                            <ArrowDown className="h-3 w-3" />
                          ) : (
                            <ChevronsUpDown className="h-3 w-3 opacity-40" />
                          ))}
                      </span>
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                onClick={() => go(row.original.ticker)}
                className="cursor-pointer border-t border-border transition-colors hover:bg-secondary/40"
              >
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-3 py-2 align-middle">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="space-y-2 md:hidden">
        {rows.map((row) => {
          const o = row.original;
          const p = topPlay(o);
          return (
            <button
              key={row.id}
              onClick={() => go(o.ticker)}
              className="w-full rounded-lg border border-border bg-card p-3 text-left"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-xs">{o.ticker}</div>
                  <div className="truncate text-xs text-muted-foreground">
                    {o.title}
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 text-xs font-semibold",
                    scoreTone(o.score),
                  )}
                >
                  {num(o.score, 3)}
                </span>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Mid {priceCents(o.mid)}</span>
                <span>Spread {priceCents(o.spread)}</span>
                <span>Closes {countdown(o.hours_to_close)}</span>
                {p && <PlayPill kind={p.kind} side={p.side} />}
                <BotStatusPill action={o.bot_action} />
              </div>
            </button>
          );
        })}
      </div>
    </>
  );
}
