import { X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

export interface Filters {
  category: string;
  archetype: string;
  play: string;
  minScore: string;
  minEdge: string;
}

export const DEFAULT_FILTERS: Filters = {
  category: "all",
  archetype: "all",
  play: "all",
  minScore: "all",
  minEdge: "all",
};

const SCORE_OPTS = [
  { value: "all", label: "Any score" },
  { value: "0.35", label: "Score ≥ 0.35" },
  { value: "0.5", label: "Score ≥ 0.50" },
];
const EDGE_OPTS = [
  { value: "all", label: "Any edge" },
  { value: "0", label: "Edge > 0" },
  { value: "1", label: "Edge ≥ 1 hs" },
  { value: "3", label: "Edge ≥ 3 hs" },
];
const ARCHETYPE_OPTS = [
  { value: "all", label: "Any archetype" },
  { value: "single_name", label: "Single name" },
  { value: "broad_basket", label: "Broad basket" },
  { value: "numeric_range", label: "Numeric range" },
  { value: "binary_calendar", label: "Binary calendar" },
];
const PLAY_OPTS = [
  { value: "all", label: "Any play" },
  { value: "taker_fade", label: "Taker fade" },
  { value: "maker_quote", label: "Maker quote" },
  { value: "skip", label: "Skip" },
];

interface Props {
  categories: string[];
  value: Filters;
  onChange: (next: Filters) => void;
}

/** Client-side filter bar (HANDOFF §4.1.E). Selected values are mirrored to the URL. */
export function FilterBar({ categories, value, onChange }: Props) {
  const set = (k: keyof Filters) => (v: string) => onChange({ ...value, [k]: v });
  const dirty = (Object.keys(DEFAULT_FILTERS) as (keyof Filters)[]).some(
    (k) => value[k] !== DEFAULT_FILTERS[k],
  );

  const pick = (
    k: keyof Filters,
    opts: { value: string; label: string }[],
    width = "w-[150px]",
  ) => (
    <Select value={value[k]} onValueChange={set(k)}>
      <SelectTrigger className={`${width} h-8 text-xs`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {opts.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      {pick("category", [
        { value: "all", label: "All categories" },
        ...categories.map((c) => ({ value: c, label: c })),
      ])}
      {pick("minScore", SCORE_OPTS, "w-[130px]")}
      {pick("minEdge", EDGE_OPTS, "w-[120px]")}
      {pick("archetype", ARCHETYPE_OPTS, "w-[150px]")}
      {pick("play", PLAY_OPTS, "w-[130px]")}
      {dirty && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={() => onChange(DEFAULT_FILTERS)}
        >
          <X className="mr-1 h-3 w-3" />
          Clear
        </Button>
      )}
    </div>
  );
}

/** Apply a Filters set to a list of opportunities. */
export function applyFilters<
  T extends {
    category?: string;
    score?: number;
    edge?: number | null;
    archetype?: string;
    plays?: Array<{ kind?: string }>;
  },
>(rows: T[], f: Filters): T[] {
  return rows.filter((r) => {
    if (f.category !== "all" && r.category !== f.category) return false;
    if (f.minScore !== "all" && (r.score ?? 0) < Number(f.minScore)) return false;
    if (f.minEdge !== "all") {
      const e = r.edge ?? null;
      if (e == null || e < Number(f.minEdge)) return false;
    }
    if (f.archetype !== "all" && r.archetype !== f.archetype) return false;
    if (f.play !== "all" && !(r.plays ?? []).some((p) => p.kind === f.play))
      return false;
    return true;
  });
}
