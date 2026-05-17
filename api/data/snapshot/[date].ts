import { makeDataHandler, dateFromPath } from "../../_lib/handler";

export const config = { runtime: "edge" };

export default makeDataHandler((url) => {
  const date = dateFromPath(url);
  return date ? `snapshots/${date}.json` : null;
});
