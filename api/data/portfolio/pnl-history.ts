import { makeDataHandler } from "../../_lib/handler";

export const config = { runtime: "edge" };

// ?mode=paper|live (default paper). Returns JSONL (one P&L point per line).
export default makeDataHandler((url) => {
  const mode = url.searchParams.get("mode") === "live" ? "live" : "paper";
  return `portfolio/pnl_history.${mode}.jsonl`;
});
