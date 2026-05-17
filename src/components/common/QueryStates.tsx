/** Shared loading / empty / error panels (PLAN §5.5 — every panel handles all three). */
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { NotFoundError } from "@/lib/api";

export function LoadingSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-2" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border py-10 text-center">
      <Inbox className="h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-medium">{title}</p>
      {hint && <p className="max-w-md text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ErrorState({
  error,
  onRetry,
  empty,
}: {
  error: unknown;
  onRetry?: () => void;
  /** Rendered instead of an error when the cause is a plain 404. */
  empty?: React.ReactNode;
}) {
  if (error instanceof NotFoundError && empty) return <>{empty}</>;
  const message =
    error instanceof Error ? error.message : "Unexpected error loading data.";
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-rose-500/30 bg-rose-500/5 py-8 text-center">
      <AlertTriangle className="h-6 w-6 text-rose-400" />
      <div>
        <p className="text-sm font-medium text-rose-300">Couldn’t load data</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          Retry
        </Button>
      )}
    </div>
  );
}
