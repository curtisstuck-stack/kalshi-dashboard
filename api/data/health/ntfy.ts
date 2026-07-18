import { makeDataHandler } from "../../_lib/handler";

export const config = { runtime: "edge" };

// Deprecated dual-read path (pre-Slack artifact name). The bot now publishes
// health/alerts.json; this endpoint remains one deploy cycle for transition.
export default makeDataHandler(() => "health/ntfy.json");
