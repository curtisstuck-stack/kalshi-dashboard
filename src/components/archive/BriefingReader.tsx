import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Card, CardContent } from "@/components/ui/card";

/**
 * Renders a briefing's markdown (HANDOFF §4.5.B). GFM tables/headers/code via
 * remark-gfm; styling applied through scoped arbitrary variants so we don't
 * need the Tailwind typography plugin.
 */
export function BriefingReader({ markdown }: { markdown: string }) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div
          className={[
            "text-sm leading-relaxed text-foreground/90",
            "[&_h1]:mb-3 [&_h1]:text-lg [&_h1]:font-semibold",
            "[&_h2]:mb-2 [&_h2]:mt-5 [&_h2]:text-base [&_h2]:font-semibold",
            "[&_h3]:mb-1.5 [&_h3]:mt-4 [&_h3]:text-sm [&_h3]:font-semibold",
            "[&_p]:my-2.5 [&_ul]:my-2.5 [&_ul]:list-disc [&_ul]:pl-5",
            "[&_ol]:my-2.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1",
            "[&_strong]:font-semibold [&_strong]:text-foreground",
            "[&_a]:text-sky-400 [&_a]:underline",
            "[&_code]:rounded [&_code]:bg-secondary [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs",
            "[&_hr]:my-4 [&_hr]:border-border",
            "[&_table]:my-3 [&_table]:w-full [&_table]:text-xs",
            "[&_th]:border [&_th]:border-border [&_th]:bg-secondary/50 [&_th]:px-2 [&_th]:py-1 [&_th]:text-left",
            "[&_td]:border [&_td]:border-border [&_td]:px-2 [&_td]:py-1",
            "[&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:text-muted-foreground",
          ].join(" ")}
        >
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
