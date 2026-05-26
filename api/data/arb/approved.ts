import { makeDataHandler } from "../../_lib/handler";

export const config = { runtime: "edge" };

/** Approved mappings consumed by the Phase 1.4 paper scanner. */
export default makeDataHandler(() => "arb/approved.jsonl");
