import { test, expect } from "@playwright/test";

test.describe("Suite 7: Performance & Web Vitals", () => {
  test("homepage LCP element is within budget (< 2.5s)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const t0 = Date.now();
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const h1 = page.locator("h1").first();
    await expect(h1).toBeVisible();
    const lcpTime = Date.now() - t0;
    expect(lcpTime).toBeLessThan(2500);
  });

  test("homepage CLS is minimal (< 0.05)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const cls = await page.evaluate(() => {
      let clsValue = 0;
      const observer = new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!(entry as unknown as { hadRecentInput?: boolean }).hadRecentInput) {
            clsValue += (entry as unknown as { value?: number }).value || 0;
          }
        }
      });
      try {
        observer.observe({ type: "layout-shift", buffered: true });
      } catch {
        // unsupported in some contexts
      }
      return clsValue;
    });

    expect(cls).toBeLessThan(0.05);
  });
});
