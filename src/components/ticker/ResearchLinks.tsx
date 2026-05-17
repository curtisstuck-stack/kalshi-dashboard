import { ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import type { ResearchArticle } from "@/lib/api";

/** Score how relevant an article is to this market (ticker / category mention). */
function relevance(a: ResearchArticle, ticker: string, category: string): number {
  const hay = `${a.title} ${a.summary}`.toLowerCase();
  let s = 0;
  if (ticker && hay.includes(ticker.toLowerCase())) s += 2;
  if (category && hay.includes(category.toLowerCase())) s += 1;
  return s;
}

/** Linked research (HANDOFF §4.2.G) — articles touching this ticker/category. */
export function ResearchLinks({
  articles,
  ticker,
  category,
}: {
  articles: ResearchArticle[];
  ticker: string;
  category: string;
}) {
  const ranked = articles
    .map((a) => ({ a, score: relevance(a, ticker, category) }))
    .sort((x, y) => y.score - x.score);
  const matched = ranked.filter((r) => r.score > 0);
  // If nothing matches, fall back to the day's top-weighted research.
  const show = (matched.length ? matched : ranked.slice(0, 4)).slice(0, 6);
  const isFallback = matched.length === 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Linked research</CardTitle>
      </CardHeader>
      <CardContent>
        {show.length === 0 ? (
          <EmptyState title="No research items for this date" />
        ) : (
          <>
            {isFallback && (
              <p className="mb-2 text-xs text-muted-foreground">
                No items mention this market directly — showing today’s research
                context.
              </p>
            )}
            <ul className="space-y-2">
              {show.map(({ a }, i) => (
                <li key={i}>
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-start gap-1.5 text-xs"
                  >
                    <ExternalLink className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                    <span>
                      <span className="text-foreground group-hover:underline">
                        {a.title}
                      </span>
                      <span className="ml-1.5 text-muted-foreground">
                        {a.source_id}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>
    </Card>
  );
}
