import { playMeta } from "@/lib/archetypes";
import { cn } from "@/lib/utils";

/** Compact pill for a suggested play kind (taker_fade / maker_quote / skip). */
export function PlayPill({ kind, side }: { kind?: string; side?: string }) {
  const meta = playMeta(kind);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium",
        meta.tone,
      )}
    >
      {meta.label}
      {side && <span className="opacity-70">{side.toUpperCase()}</span>}
    </span>
  );
}
