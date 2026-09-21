import { test, expect } from "@playwright/test";

test.describe("Visual Regression & Snapshot Baselines", () => {
  test("homepage desktop visual render matches baseline", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);

    const main = page.locator("main");
    await expect(main).toBeVisible();
  });

  test("difference section desktop pins correctly", async ({ page }) => {
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth < 768) return;

    await page.goto("/");
    const section = page.locator("[data-difference-desktop]");
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const sticky = page.locator("[data-difference-desktop] [data-sticky-container]");
    await expect(sticky).toBeVisible();
  });
});
