import { describe, it, expect } from "vitest";
import { priceCents, pct, usdSigned, countdown, num } from "@/lib/format";
import { scoreColor, edgeLabel, freshness } from "@/lib/scoring";
import { applyFilters, DEFAULT_FILTERS } from "@/components/opportunities/FilterBar";

describe("format", () => {
  it("priceCents renders a 0..1 price as cents", () => {
    expect(priceCents(0.595)).toBe("59.5¢");
    expect(priceCents(0.5)).toBe("50¢");
    expect(priceCents(null)).toBe("—");
  });

  it("pct formats ratios", () => {
    expect(pct(0.054)).toBe("5.4%");
    expect(pct(undefined)).toBe("—");
  });

  it("usdSigned prefixes the sign", () => {
    expect(usdSigned(4.12)).toBe("+$4.12");
    expect(usdSigned(-1.2)).toBe("-$1.20");
    expect(usdSigned(null)).toBe("—");
  });

  it("countdown scales by magnitude", () => {
    expect(countdown(0.5)).toBe("30m");
    expect(countdown(14.75)).toBe("14h 45m");
    expect(countdown(335)).toBe("13d 23h");
    expect(countdown(null)).toBe("—");
  });

  it("num guards NaN/null", () => {
    expect(num(0.4495, 3)).toBe("0.450");
    expect(num(null)).toBe("—");
  });
});

describe("scoring", () => {
  it("scoreColor buckets", () => {
    expect(scoreColor(0.6)).toContain("emerald");
    expect(scoreColor(0.4)).toContain("amber");
    expect(scoreColor(0.2)).toContain("muted");
    expect(scoreColor(null)).toContain("muted");
  });

  it("edgeLabel signs the edge", () => {
    expect(edgeLabel(4.55)).toEqual({ text: "+4.55 hs", sign: "pos" });
    expect(edgeLabel(-6.4)).toEqual({ text: "-6.40 hs", sign: "neg" });
    expect(edgeLabel(null)).toEqual({ text: "—", sign: "none" });
  });

  it("freshness tiers on age", () => {
    expect(freshness(new Date().toISOString()).level).toBe("fresh");
    expect(freshness(new Date(Date.now() - 3 * 3600_000).toISOString()).level).toBe(
      "stale",
    );
    expect(freshness(new Date(Date.now() - 9 * 3600_000).toISOString()).level).toBe(
      "dead",
    );
    expect(freshness(null).level).toBe("dead");
  });
});

describe("applyFilters", () => {
  const rows = [
    { category: "Sports", score: 0.45, edge: 4.5, plays: [{ kind: "taker_fade" }] },
    { category: "Economics", score: 0.3, edge: null, plays: [] },
    { category: "Sports", score: 0.6, edge: -2, plays: [{ kind: "maker_quote" }] },
  ];

  it("passes everything through with defaults", () => {
    expect(applyFilters(rows, DEFAULT_FILTERS)).toHaveLength(3);
  });

  it("filters by category", () => {
    expect(
      applyFilters(rows, { ...DEFAULT_FILTERS, category: "Sports" }),
    ).toHaveLength(2);
  });

  it("filters by min score", () => {
    expect(
      applyFilters(rows, { ...DEFAULT_FILTERS, minScore: "0.5" }),
    ).toHaveLength(1);
  });

  it("filters by min edge, excluding null edge", () => {
    const out = applyFilters(rows, { ...DEFAULT_FILTERS, minEdge: "0" });
    expect(out).toHaveLength(1);
    expect(out[0].category).toBe("Sports");
  });

  it("filters by play kind", () => {
    expect(
      applyFilters(rows, { ...DEFAULT_FILTERS, play: "maker_quote" }),
    ).toHaveLength(1);
  });
});
