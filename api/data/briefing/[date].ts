import { makeDataHandler, dateFromPath } from "../../_lib/handler";

export const config = { runtime: "edge" };

// Serves the parsed metadata JSON. The full markdown is briefings/{date}.md;
// `?format=md` returns that instead.
export default makeDataHandler((url) => {
  const date = dateFromPath(url);
  if (!date) return null;
  const ext = url.searchParams.get("format") === "md" ? "md" : "json";
  return `briefings/${date}.${ext}`;
});
