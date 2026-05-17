/** Visual mapping for archetypes, play kinds, and bot-action outcomes. */

export type Archetype =
  | "single_name"
  | "broad_basket"
  | "numeric_range"
  | "binary_calendar";

export const ARCHETYPE_META: Record<Archetype, { label: string; tone: string }> = {
  single_name: { label: "Single name", tone: "bg-sky-500/15 text-sky-400" },
  broad_basket: { label: "Broad basket", tone: "bg-violet-500/15 text-violet-400" },
  numeric_range: { label: "Numeric range", tone: "bg-teal-500/15 text-teal-400" },
  binary_calendar: { label: "Binary calendar", tone: "bg-orange-500/15 text-orange-400" },
};

export function archetypeMeta(a: string | undefined) {
  return (
    ARCHETYPE_META[a as Archetype] ?? {
      label: "Unclassified",
      tone: "bg-muted text-muted-foreground",
    }
  );
}

export type PlayKind = "taker_fade" | "maker_quote" | "skip";

export const PLAY_META: Record<PlayKind, { label: string; tone: string }> = {
  taker_fade: { label: "Taker fade", tone: "bg-rose-500/15 text-rose-400" },
  maker_quote: { label: "Maker quote", tone: "bg-emerald-500/15 text-emerald-400" },
  skip: { label: "Skip", tone: "bg-muted text-muted-foreground" },
};

export function playMeta(kind: string | undefined) {
  return (
    PLAY_META[kind as PlayKind] ?? {
      label: kind ?? "—",
      tone: "bg-muted text-muted-foreground",
    }
  );
}

/** bot_action -> label + tone for the "Bot did" status pill (HANDOFF §4.1.B). */
export const BOT_ACTION_META: Record<string, { label: string; tone: string }> = {
  acted: { label: "Acted", tone: "bg-emerald-500/15 text-emerald-400" },
  blocked_balance: { label: "Blocked: balance", tone: "bg-amber-500/15 text-amber-400" },
  blocked_conviction: {
    label: "Blocked: conviction",
    tone: "bg-amber-500/15 text-amber-400",
  },
  blocked_allowlist: {
    label: "Blocked: allowlist",
    tone: "bg-amber-500/15 text-amber-400",
  },
  not_evaluated: { label: "Not evaluated", tone: "bg-muted text-muted-foreground" },
  no_op: { label: "No-op", tone: "bg-muted text-muted-foreground" },
};

export function botActionMeta(action: string | undefined) {
  return (
    BOT_ACTION_META[action ?? ""] ?? {
      label: "Unknown",
      tone: "bg-muted text-muted-foreground",
    }
  );
}

/** Stable color for a category chip (hashed so new categories still get a tone). */
const CATEGORY_TONES = [
  "bg-blue-500/15 text-blue-400",
  "bg-emerald-500/15 text-emerald-400",
  "bg-amber-500/15 text-amber-400",
  "bg-violet-500/15 text-violet-400",
  "bg-rose-500/15 text-rose-400",
  "bg-teal-500/15 text-teal-400",
];

export function categoryTone(category: string | undefined): string {
  if (!category) return "bg-muted text-muted-foreground";
  let h = 0;
  for (let i = 0; i < category.length; i++) h = (h * 31 + category.charCodeAt(i)) | 0;
  return CATEGORY_TONES[Math.abs(h) % CATEGORY_TONES.length];
}
