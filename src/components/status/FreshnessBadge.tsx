import { freshness, freshnessTone } from "@/lib/scoring";
import { ago } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Color-coded data-age badge: green < 90m, amber < 4h, red beyond. */
export function FreshnessBadge({ ts }: { ts: string | number | null | undefined }) {
  const { level, minutes } = freshness(ts);
  const label =
    minutes == null ? "no data" : level === "fresh" ? ago(ts) : `${ago(ts)} · ${level}`;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        freshnessTone(level),
      )}
      title={ts ? `Data timestamp: ${ts}` : undefined}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}
