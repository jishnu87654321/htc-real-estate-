import { test, expect } from "@playwright/test";

test.use({ reducedMotion: "reduce" });

test.describe("Reduced Motion Compliance (prefers-reduced-motion: reduce)", () => {
  test("hero timer does not auto-advance on reduced motion", async ({ page }) => {
    await page.goto("/");
    const counter = page.locator("[data-hero] .font-mono").first();
    await expect(counter).toContainText("01 / 04");

    // Wait 6 seconds — should remain on 01
    await page.waitForTimeout(6000);
    await expect(counter).toContainText("01 / 04");
  });

  test("all main content is immediately visible at final opacity", async ({ page }) => {
    await page.goto("/");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();

    const isVisible = await h1.evaluate((el) => {
      const s = window.getComputedStyle(el);
      return s.opacity === "1" && s.visibility !== "hidden";
    });
    expect(isVisible).toBe(true);
  });
});
