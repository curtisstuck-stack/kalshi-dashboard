import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright runs against a DEPLOYED dashboard (auth + edge functions need the
 * Vercel runtime). Configure via env:
 *   E2E_BASE_URL  — deployment URL (default: production alias)
 *   E2E_PASSWORD  — the SITE_PASSWORD for the login gate
 *
 * Run:  E2E_PASSWORD=... pnpm test:e2e
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 1,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "https://kalshi-dashboard-khaki.vercel.app",
    trace: "on-first-retry",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
