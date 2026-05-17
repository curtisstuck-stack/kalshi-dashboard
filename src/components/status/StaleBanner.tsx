import { Link } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { useManifest } from "@/hooks/data";
import { freshness } from "@/lib/scoring";
import { ago } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * App-wide staleness banner (HANDOFF §8). The droplet pusher commits every
 * 15 min; if the manifest is >90 min old something has stalled.
 */
export function StaleBanner() {
  const manifest = useManifest();
  const ts = manifest.data?.generated_at;
  const { level } = freshness(ts);
  if (!ts || level === "fresh") return null;

  const dead = level === "dead";
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b px-4 py-1.5 text-xs",
        dead
          ? "border-rose-500/30 bg-rose-500/10 text-rose-300"
          : "border-amber-500/30 bg-amber-500/10 text-amber-300",
      )}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span>
        Data last refreshed {ago(ts)} — the droplet pusher may have stalled.
      </span>
      <Link to="/health" className="ml-auto underline">
        Check health
      </Link>
    </div>
  );
}
