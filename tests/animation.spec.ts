import { test, expect } from "@playwright/test";

test.describe("Suite 5: Animation Stability & Single-Owner Rules", () => {
  test("no position: fixed inside any section content", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const violations = await page.evaluate(() => {
      const sections = Array.from(document.querySelectorAll("main section, [data-hero], [data-difference]"));
      const bad: string[] = [];
      sections.forEach((sec) => {
        sec.querySelectorAll("*").forEach((el) => {
          const s = window.getComputedStyle(el);
          if (s.position === "fixed") {
            bad.push(el.tagName + "." + (el.className || ""));
          }
        });
      });
      return bad;
    });

    expect(violations).toHaveLength(0);
  });

  test("no .pin-spacer elements in DOM", async ({ page }) => {
    await page.goto("/");
    const count = await page.locator(".pin-spacer, [data-pin-spacer]").count();
    expect(count).toBe(0);
  });

  test("difference section card stack height is bounded between 150px and 420px", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const stack = page.locator("[data-card-stack]");
    if (await stack.isVisible()) {
      const box = await stack.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(150);
      expect(box?.height).toBeLessThanOrEqual(420);
    }
  });
});
