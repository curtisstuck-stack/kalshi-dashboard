import { Pie, PieChart, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/QueryStates";
import { archetypeMeta } from "@/lib/archetypes";
import type { Opportunity } from "@/types";

const SLICE_COLORS = [
  "hsl(199 80% 55%)",
  "hsl(262 70% 60%)",
  "hsl(168 70% 45%)",
  "hsl(30 90% 55%)",
  "hsl(220 10% 45%)",
];

/** Archetype distribution over the latest scan (HANDOFF §4.4.D). */
export function ArchetypePie({ opportunities }: { opportunities: Opportunity[] }) {
  const counts = new Map<string, number>();
  for (const o of opportunities) {
    const key = o.archetype ?? "unclassified";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const data = [...counts.entries()].map(([key, value]) => ({
    name: archetypeMeta(key === "unclassified" ? undefined : key).label,
    value,
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Archetype distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState title="No markets in the latest scan" />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="45%"
                  outerRadius="75%"
                  paddingAngle={2}
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 6,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
