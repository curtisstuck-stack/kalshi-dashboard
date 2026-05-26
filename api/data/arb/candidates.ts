import { makeDataHandler } from "../../_lib/handler";

export const config = { runtime: "edge" };

/**
 * Phase 1.3 mapper output — LLM-judged Kalshi↔Polymarket pair candidates
 * awaiting human approval.
 */
export default makeDataHandler(() => "arb/candidates.jsonl");
