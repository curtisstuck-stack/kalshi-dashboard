import { makeDataHandler } from "../../_lib/handler";

export const config = { runtime: "edge" };

export default makeDataHandler(() => "portfolio/settlements.jsonl");
