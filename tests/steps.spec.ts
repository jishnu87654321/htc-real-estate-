import { test, expect } from "@playwright/test";

test.describe("Three steps connector", () => {
  for (const width of [1920, 1440, 1024, 768, 390]) {
    test(`line endpoints meet marker centres @${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      const section = page.locator("[data-steps]");
      await section.scrollIntoViewIfNeeded();
      await page.evaluate(() => document.fonts?.ready);
      await page.waitForTimeout(300);

      const m = await page.$$eval("[data-step-marker]", (els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
        })
      );
      const track = await page.locator("[data-connector-track]").boundingBox();

      expect(m.length).toBe(3);
      expect(track).not.toBeNull();

      const horizontal = width >= 768;
      if (horizontal) {
        expect(Math.abs(track!.x - m[0].x)).toBeLessThanOrEqual(2); // S3-01: Line starts at circle 1 centre
        expect(Math.abs(track!.x + track!.width - m[2].x)).toBeLessThanOrEqual(2); // S3-02: Line ends at circle 3 centre
        expect(Math.abs(track!.y + track!.height / 2 - m[0].y)).toBeLessThanOrEqual(2);
      } else {
        expect(Math.abs(track!.y - m[0].y)).toBeLessThanOrEqual(3);
        expect(Math.abs(track!.y + track!.height - m[2].y)).toBeLessThanOrEqual(3);
      }
    });
  }

  test("markers start inactive and activate in order", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const section = page.locator("[data-steps]");
    const marker1 = page.locator("[data-step-marker]").nth(0);
    const marker2 = page.locator("[data-step-marker]").nth(1);
    const marker3 = page.locator("[data-step-marker]").nth(2);

    // Initial state at top of page before section enters scroll offset
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(100);

    // Scroll into view
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    await expect(marker1).toHaveClass(/bg-red-600/);

    // Scroll further down through section
    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(300);
    await expect(marker2).toHaveClass(/bg-red-600/);

    await page.evaluate(() => window.scrollBy(0, 300));
    await page.waitForTimeout(300);
    await expect(marker3).toHaveClass(/bg-red-600/);
  });

  test("scrolling up un-reaches markers", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const section = page.locator("[data-steps]");
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    // Scroll down to activate all steps
    await page.evaluate(() => window.scrollBy(0, 400));
    await page.waitForTimeout(300);

    const marker3 = page.locator("[data-step-marker]").nth(2);
    await expect(marker3).toHaveClass(/bg-red-600/);

    // Scroll up
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // Marker 3 should un-reach back to inactive white background
    await expect(marker3).toHaveClass(/bg-white/);
  });

  test("CTA appears after step 3 and stays on scroll-up", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const section = page.locator("[data-steps]");
    await section.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(300);

    const cta = page.locator("[data-steps] a", { hasText: "Start searching" });
    await expect(cta).toBeVisible();

    // Scroll back up to the top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);

    // CTA stays visible
    await expect(cta).toBeVisible();
  });

  test("uses an ordered list with three items", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-steps] ol > li")).toHaveCount(3);
  });

  test("geometry survives a container resize without reload", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("[data-steps]").scrollIntoViewIfNeeded();
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(300);

    // Initial 1440 check
    let m = await page.$$eval("[data-step-marker]", (els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })
    );
    let track = await page.locator("[data-connector-track]").boundingBox();
    expect(Math.abs(track!.x - m[0].x)).toBeLessThanOrEqual(2);
    expect(Math.abs(track!.x + track!.width - m[2].x)).toBeLessThanOrEqual(2);

    // Resize to 1024
    await page.setViewportSize({ width: 1024, height: 900 });
    await page.waitForTimeout(300);
    m = await page.$$eval("[data-step-marker]", (els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })
    );
    track = await page.locator("[data-connector-track]").boundingBox();
    expect(Math.abs(track!.x - m[0].x)).toBeLessThanOrEqual(2);
    expect(Math.abs(track!.x + track!.width - m[2].x)).toBeLessThanOrEqual(2);

    // Resize back to 1440
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.waitForTimeout(300);
    m = await page.$$eval("[data-step-marker]", (els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })
    );
    track = await page.locator("[data-connector-track]").boundingBox();
    expect(Math.abs(track!.x - m[0].x)).toBeLessThanOrEqual(2);
    expect(Math.abs(track!.x + track!.width - m[2].x)).toBeLessThanOrEqual(2);
  });
});

test.describe("Three steps reduced motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("reduced motion renders final state immediately", async ({ page }) => {
    await page.goto("/");
    const markers = page.locator("[data-step-marker]");
    await expect(markers).toHaveCount(3);
    for (let i = 0; i < 3; i++) {
      await expect(markers.nth(i)).toHaveClass(/bg-red-600/);
    }

    const cta = page.locator("[data-steps] a", { hasText: "Start searching" });
    await expect(cta).toBeVisible();
  });
});

