import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";

/**
 * Polymarket arb-gap monitor (HANDOFF §4.4.F).
 *
 * The polymarket_arb_log isn't present on the droplet, so there's no source to
 * surface yet. The panel stays in place with an honest empty state and lights
 * up once the arb watcher writes a log the pusher can ship.
 */
export function ArbGapTable() {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Polymarket arb gaps</CardTitle>
      </CardHeader>
      <CardContent>
        <EmptyState
          title="No cross-platform arb data"
          hint="The polymarket arb watcher isn't writing a log on the droplet — once it does, gaps above the alert threshold will appear here."
        />
      </CardContent>
    </Card>
  );
}
