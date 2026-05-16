import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  title: string;
  phase: string;
  spec: string;
  children?: React.ReactNode;
}

/**
 * Honest placeholder for pages not yet implemented. Replaced phase by phase.
 * `phase` names the build phase that fills this in; `spec` cites HANDOFF.md.
 */
export function PagePlaceholder({ title, phase, spec, children }: Props) {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-muted-foreground">
            Scaffolded — built in {phase}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>Implementation spec: {spec}</p>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}
