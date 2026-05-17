import { GitCompareArrows } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { Opportunity } from "@/types";

/**
 * Engine-vs-bot reconcile chip (HANDOFF §4.1.C).
 *
 * The full reconcile (common / engine-only / bot-only / rank disagreement)
 * needs the bot's scanner output, which isn't published to the data repo yet.
 * Until then this chip reports how many of today's opportunities carry a
 * `bot_action` annotation and stays honest about the gap.
 */
export function ReconcileChip({ opportunities }: { opportunities: Opportunity[] }) {
  const annotated = opportunities.filter((o) => o.bot_action).length;
  const total = opportunities.length;
  const hasData = annotated > 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            hasData
              ? "border-border bg-card"
              : "border-dashed border-border text-muted-foreground",
          )}
        >
          <GitCompareArrows className="h-3.5 w-3.5" />
          {hasData
            ? `Bot reconciled ${annotated}/${total}`
            : "Reconcile pending"}
        </span>
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">
        {hasData
          ? `${annotated} of ${total} opportunities carry a bot-action annotation.`
          : "The bot's scanner output isn't published to the data repo yet, so engine-vs-bot reconciliation is unavailable. It activates once the bot emits per-market actions."}
      </TooltipContent>
    </Tooltip>
  );
}
