import { botActionMeta } from "@/lib/archetypes";
import { cn } from "@/lib/utils";

/**
 * "Bot did" status pill (HANDOFF §4.1.B). `bot_action` is not yet emitted by
 * the bot — when absent we show a neutral "—" rather than a misleading state.
 */
export function BotStatusPill({ action }: { action?: string }) {
  if (!action) {
    return (
      <span className="text-xs text-muted-foreground" title="Bot action not yet reported">
        —
      </span>
    );
  }
  const meta = botActionMeta(action);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        meta.tone,
      )}
    >
      {meta.label}
    </span>
  );
}
