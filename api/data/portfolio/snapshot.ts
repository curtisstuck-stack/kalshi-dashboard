import { makeDataHandler } from "../../_lib/handler";

export const config = { runtime: "edge" };

// ?mode=paper|live (default paper). `both` is fetched client-side as two calls.
export default makeDataHandler((url) => {
  const mode = url.searchParams.get("mode") === "live" ? "live" : "paper";
  return `portfolio/snapshot.${mode}.json`;
});
