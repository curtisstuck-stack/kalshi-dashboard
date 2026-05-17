import { makeDataHandler, dateFromPath } from "../../_lib/handler";

export const config = { runtime: "edge" };

// ?format=outcomes returns the {date}.outcomes.md status notes; default = JSON.
export default makeDataHandler((url) => {
  const date = dateFromPath(url);
  if (!date) return null;
  return url.searchParams.get("format") === "outcomes"
    ? `handovers/${date}.outcomes.md`
    : `handovers/${date}.json`;
});
