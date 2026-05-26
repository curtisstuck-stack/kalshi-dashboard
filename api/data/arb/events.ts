import { makeDataHandler } from "../../_lib/handler";

export const config = { runtime: "edge" };

/** Live arb-leg events emitted by the paper-mode scanner. */
export default makeDataHandler(() => "arb/events.jsonl");
