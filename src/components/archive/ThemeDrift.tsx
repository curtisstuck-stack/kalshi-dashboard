import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { tagFrequency } from "@/lib/handover";
import type { Briefing } from "@/types";

/** Theme-drift view (HANDOFF §4.5.D) — how often each theme tag recurs. */
export function ThemeDrift({ briefings }: { briefings: Briefing[] }) {
  const freq = tagFrequency(briefings);
  const max = freq[0]?.count ?? 1;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Theme drift</CardTitle>
      </CardHeader>
      <CardContent>
        {freq.length === 0 ? (
          <EmptyState title="No theme tags across briefings yet" />
        ) : (
          <>
            <p className="mb-3 text-xs text-muted-foreground">
              Strategy themes by frequency across {briefings.length} briefing
              {briefings.length === 1 ? "" : "s"}.
            </p>
            <ul className="space-y-1.5">
              {freq.map((f) => (
                <li key={f.tag} className="flex items-center gap-2">
                  <span className="w-44 shrink-0 truncate text-xs" title={f.tag}>
                    {f.tag}
                  </span>
                  <div className="h-2 flex-1 rounded bg-secondary">
                    <div
                      className="h-2 rounded bg-teal-500/70"
                      style={{ width: `${(f.count / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                    {f.count}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
