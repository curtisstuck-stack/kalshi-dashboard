import { describe, it, expect } from "vitest";
import { parseOutcomes, tagFrequency } from "@/lib/handover";

describe("parseOutcomes", () => {
  const md = `
# Outcomes
- H-2026-05-14-001 — LANDED  (commit abc1234, +210/-12 LOC)
- H-2026-05-14-002 — DEFERRED (needs more data)
- H-2026-05-14-003 — REJECTED (rationale not supported)
random line that should be ignored
`;

  it("extracts status and note per item id", () => {
    const out = parseOutcomes(md);
    expect(out["H-2026-05-14-001"].status).toBe("LANDED");
    expect(out["H-2026-05-14-001"].note).toContain("abc1234");
    expect(out["H-2026-05-14-002"].status).toBe("DEFERRED");
    expect(out["H-2026-05-14-003"].status).toBe("REJECTED");
  });

  it("ignores non-matching lines", () => {
    expect(Object.keys(parseOutcomes(md))).toHaveLength(3);
    expect(parseOutcomes("nothing here")).toEqual({});
  });
});

describe("tagFrequency", () => {
  it("counts tag occurrences across briefings, sorted desc", () => {
    const freq = tagFrequency([
      { tags: ["maker-edge", "event-shock"] },
      { tags: ["maker-edge"] },
      { tags: [] },
    ]);
    expect(freq[0]).toEqual({ tag: "maker-edge", count: 2 });
    expect(freq).toHaveLength(2);
  });
});
