import { describe, it, expect } from "vitest";
import {
  computeKpis,
  equitySeries,
  maxDrawdown,
  attribution,
  withinWindow,
} from "@/lib/portfolio";
import type { Settlement } from "@/lib/api";

function s(net: number, when: string, extra: Partial<Settlement> = {}): Settlement {
  return { ticker: "KX", net_pnl_cents: net, settled_at: when, ...extra };
}

const sample: Settlement[] = [
  s(120, "2026-05-10T00:00:00Z", { signal_sources: ["weather"], direction: "yes" }),
  s(-40, "2026-05-11T00:00:00Z", { signal_sources: ["weather"], direction: "no" }),
  s(60, "2026-05-12T00:00:00Z", { signal_sources: ["polymarket"], direction: "yes" }),
];

describe("computeKpis", () => {
  it("aggregates P&L, win rate, and averages", () => {
    const k = computeKpis(sample);
    expect(k.tradeCount).toBe(3);
    expect(k.totalPnlUsd).toBeCloseTo(1.4);
    expect(k.winCount).toBe(2);
    expect(k.lossCount).toBe(1);
    expect(k.winRate).toBeCloseTo(2 / 3);
    expect(k.avgWinUsd).toBeCloseTo(0.9);
    expect(k.avgLossUsd).toBeCloseTo(-0.4);
    expect(k.expectancyUsd).toBeCloseTo(1.4 / 3);
  });

  it("returns nulls for an empty set, never NaN", () => {
    const k = computeKpis([]);
    expect(k.tradeCount).toBe(0);
    expect(k.winRate).toBeNull();
    expect(k.avgWinUsd).toBeNull();
    expect(k.expectancyUsd).toBeNull();
    expect(k.totalPnlUsd).toBe(0);
  });
});

describe("equitySeries", () => {
  it("accumulates P&L in settlement order", () => {
    const e = equitySeries(sample);
    expect(e.map((p) => Math.round(p.cumUsd * 100) / 100)).toEqual([
      1.2, 0.8, 1.4,
    ]);
  });
});

describe("maxDrawdown", () => {
  it("finds the largest peak-to-trough drop", () => {
    expect(maxDrawdown([0, 5, 2, 8, 1])).toBe(7);
    expect(maxDrawdown([1, 2, 3])).toBe(0);
  });
});

describe("attribution", () => {
  it("groups P&L by signal", () => {
    const rows = attribution(sample, "signal");
    expect(rows.find((r) => r.key === "weather")?.pnlUsd).toBeCloseTo(0.8);
    expect(rows.find((r) => r.key === "polymarket")?.trades).toBe(1);
  });
});

describe("withinWindow", () => {
  it("filters to a trailing window", () => {
    const recent = s(10, new Date().toISOString());
    const old = s(10, "2020-01-01T00:00:00Z");
    expect(withinWindow([recent, old], 7)).toHaveLength(1);
    expect(withinWindow([recent, old], null)).toHaveLength(2);
  });
});
