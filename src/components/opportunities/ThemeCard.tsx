import { Lightbulb } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Briefing } from "@/types";

/** Today's research theme (HANDOFF §4.1.D) — executive summary + theme tags. */
export function ThemeCard({ briefing }: { briefing: Briefing }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          Today’s theme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {briefing.summary || briefing.theme}
        </p>
        {briefing.tags && briefing.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {briefing.tags.map((t) => (
              <span
                key={t}
                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
              >
                {t}
              </span>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
