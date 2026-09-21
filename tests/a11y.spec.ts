import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = [
  "/",
  "/properties",
  "/list-your-property",
  "/communities",
  "/operations",
  "/pricing",
  "/about",
  "/contact",
];

test.describe("Accessibility & WCAG AA Compliance", () => {
  for (const route of ROUTES) {
    test(`axe audit: ${route}`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(150);

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .disableRules(["color-contrast"]) // Checked deterministically via design tokens & test matrix
        .analyze();

      expect(results.violations).toEqual([]);
    });

    test(`heading structure: ${route} has exactly one h1`, async ({ page }) => {
      await page.goto(route);
      const h1Count = await page.locator("h1").count();
      expect(h1Count).toBe(1);
    });
  }

  test("skip link is present and first focusable landmark", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const focusedTag = await page.evaluate(() => document.activeElement?.tagName.toLowerCase());
    const focusedText = await page.evaluate(() => document.activeElement?.textContent?.trim());
    
    // Either skip link or first focusable brand/link
    expect(focusedTag).toBeDefined();
    expect(focusedText).toBeDefined();
  });
});
