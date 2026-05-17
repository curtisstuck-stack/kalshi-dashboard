import { test, expect } from "@playwright/test";

const PASSWORD = process.env.E2E_PASSWORD;

test.describe("dashboard smoke", () => {
  test.skip(!PASSWORD, "set E2E_PASSWORD to run the smoke test");

  test("login -> home -> ticker detail -> back", async ({ page }) => {
    // Any route redirects to the login gate.
    await page.goto("/");
    await expect(page).toHaveURL(/\/login/);

    // Log in.
    await page.getByLabel("Site password").fill(PASSWORD!);
    await page.getByRole("button", { name: "Enter" }).click();

    // Home page renders.
    await expect(
      page.getByRole("heading", { name: /Today.s Opportunities/i }),
    ).toBeVisible();

    // Wait for the opportunity table (or an explicit empty state).
    const firstRow = page.locator("table tbody tr").first();
    const hasRows = await firstRow
      .waitFor({ state: "visible", timeout: 10_000 })
      .then(() => true)
      .catch(() => false);

    if (hasRows) {
      await firstRow.click();
      await expect(page).toHaveURL(/\/ticker\//);
      await expect(page.getByText("Score breakdown")).toBeVisible();

      // Back returns to Home.
      await page.getByRole("button", { name: "Back" }).click();
      await expect(
        page.getByRole("heading", { name: /Today.s Opportunities/i }),
      ).toBeVisible();
    } else {
      // No opportunities today — the page must still render a clean empty state,
      // never an error or a blank panel.
      await expect(page.getByText(/No opportunities/i)).toBeVisible();
    }
  });

  test("portfolio page renders KPIs and equity curve", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Site password").fill(PASSWORD!);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(
      page.getByRole("heading", { name: /Today.s Opportunities/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Portfolio" }).click();
    await expect(
      page.getByRole("heading", { name: /Paper \+ Live Portfolio/i }),
    ).toBeVisible();
    await expect(page.getByText("Total P&L")).toBeVisible();
    await expect(page.getByText("Equity curve")).toBeVisible();
  });

  test("signals and health pages render", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Site password").fill(PASSWORD!);
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(
      page.getByRole("heading", { name: /Today.s Opportunities/i }),
    ).toBeVisible();

    await page.getByRole("link", { name: "Signals" }).click();
    await expect(
      page.getByRole("heading", { name: /Signal Logic Explorer/i }),
    ).toBeVisible();
    await expect(page.getByText("Calibration reliability")).toBeVisible();

    await page.getByRole("link", { name: "Health" }).click();
    await expect(
      page.getByRole("heading", { name: /Bot Health/i }),
    ).toBeVisible();
    await expect(page.getByText("Recent halts")).toBeVisible();
  });

  test("wrong password is rejected", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Site password").fill("definitely-wrong");
    await page.getByRole("button", { name: "Enter" }).click();
    await expect(page.getByText(/incorrect password/i)).toBeVisible();
  });
});
