import { Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Regime state (HANDOFF §4.4.E). The HMM regime detector (H-2026-05-14-001 /
 * regime_hmm) isn't shipped — this is the v1 placeholder.
 */
export function RegimeBadge() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Regime state</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-8 text-center">
          <Activity className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">HMM regime detector not yet shipped</p>
          <p className="max-w-sm text-xs text-muted-foreground">
            CALM / TRENDING / CHAOTIC classification activates once
            <span className="font-mono"> signals/regime_hmm </span>
            lands and the bot publishes <span className="font-mono">regime_state.json</span>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
