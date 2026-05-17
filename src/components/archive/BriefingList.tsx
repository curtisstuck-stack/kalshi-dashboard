import { dateLong } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Date sidebar for the Research Archive (HANDOFF §4.5.A). */
export function BriefingList({
  dates,
  selected,
  onSelect,
}: {
  dates: string[];
  selected?: string;
  onSelect: (date: string) => void;
}) {
  if (dates.length === 0) {
    return (
      <p className="px-2 py-4 text-xs text-muted-foreground">
        No briefings published yet.
      </p>
    );
  }
  return (
    <ul className="space-y-1">
      {dates.map((d) => (
        <li key={d}>
          <button
            onClick={() => onSelect(d)}
            className={cn(
              "w-full rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
              d === selected
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
            )}
          >
            <div className="font-medium">{dateLong(d)}</div>
            <div className="font-mono text-[11px] opacity-70">{d}</div>
          </button>
        </li>
      ))}
    </ul>
  );
}
