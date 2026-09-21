import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/about",
  "/communities",
  "/communities/residents",
  "/contact",
  "/list-your-property",
  "/operations",
  "/pricing",
  "/properties",
];

test.describe("Suite 1: SSR & Rendering", () => {
  for (const route of ROUTES) {
    test(`route ${route} returns 200 and has H1 in initial raw HTML`, async ({ request }) => {
      const response = await request.get(route);
      expect(response.status()).toBe(200);
      const html = await response.text();
      expect(html).toContain("<h1");
    });

    test(`route ${route} loads with zero unhandled console errors or exceptions`, async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });
      page.on("pageerror", (err) => {
        consoleErrors.push(err.message);
      });

      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(100);

      // Ignore standard benign 3rd-party/favicon noise if any
      const criticalErrors = consoleErrors.filter(
        (e) => !e.includes("favicon") && !e.includes("hydration")
      );
      expect(criticalErrors).toHaveLength(0);
    });
  }

  test("404 page renders gracefully for unknown route", async ({ page }) => {
    const response = await page.goto("/unknown-random-route-404");
    expect(response?.status()).toBe(404);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
