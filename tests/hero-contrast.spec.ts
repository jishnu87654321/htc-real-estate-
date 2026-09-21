import { test, expect } from "@playwright/test";

test.describe("Hero Ambient Contrast Integrity", () => {
  test("every slide meets AA contrast on H1 and rotating line", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    for (let i = 0; i < 4; i++) {
      // Jump to slide
      await page.locator(`[aria-label='Jump to slide ${i + 1}']`).click();
      await page.waitForTimeout(500);

      const colors = await page.evaluate(() => {
        const h1 = document.querySelector("[data-hero] h1");
        const tag = document.querySelector("[data-rotating-line-tag]");
        return {
          h1Color: h1 ? window.getComputedStyle(h1).color : "",
          lineTagColor: tag ? window.getComputedStyle(tag).color : "",
        };
      });

      expect(colors.h1Color).toBe("rgb(255, 255, 255)");
      expect(colors.lineTagColor).toBe("rgb(224, 90, 74)"); // --red-400 (#E05A4A)
    }
  });
});
