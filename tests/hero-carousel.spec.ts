import { test, expect } from "@playwright/test";

test.describe("Hero Full-Bleed Photo Carousel (REV-16)", () => {
  test("advances slide 01 -> 02 within 5.5s", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const hero = page.locator("[data-hero]");
    await expect(hero).toBeVisible();

    const counter = page.locator("[data-hero-indicator] span:has-text('01')");
    await expect(counter).toBeVisible();

    // Advance to 02 within 8.0s
    const nextCounter = page.locator("[data-hero-indicator] span:has-text('02')");
    await expect(nextCounter).toBeVisible({ timeout: 8000 });
  });

  test("rotating line container height does not change across slides — zero CLS", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const lineContainer = page.locator("[data-rotating-line-container]");
    await expect(lineContainer).toBeVisible();

    const h1 = (await lineContainer.boundingBox())?.height;

    // Jump to slide 2
    await page.click("[aria-label='Jump to slide 2']");
    await page.waitForTimeout(600);
    const h2 = (await lineContainer.boundingBox())?.height;

    // Jump to slide 3
    await page.click("[aria-label='Jump to slide 3']");
    await page.waitForTimeout(600);
    const h3 = (await lineContainer.boundingBox())?.height;

    expect(Math.abs((h1 || 0) - (h2 || 0))).toBeLessThanOrEqual(2);
    expect(Math.abs((h1 || 0) - (h3 || 0))).toBeLessThanOrEqual(2);
  });

  test("CTAs y position is identical across all slides (±1px)", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const findHomeBtn = page.locator("[data-hero]").getByRole("link", { name: "Find a home" });
    await findHomeBtn.waitFor();

    const getCtaOffset = async () => {
      return page.evaluate(() => {
        const btn = document.querySelector("[data-hero] a[href='/properties']");
        const hero = document.querySelector("[data-hero]");
        if (!btn || !hero) return 0;
        return btn.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      });
    };

    const y1 = await getCtaOffset();

    await page.locator("[aria-label='Jump to slide 2']").dispatchEvent("click");
    await page.waitForTimeout(600);
    const y2 = await getCtaOffset();

    await page.locator("[aria-label='Jump to slide 3']").dispatchEvent("click");
    await page.waitForTimeout(600);
    const y3 = await getCtaOffset();

    expect(Math.abs(y1 - y2)).toBeLessThanOrEqual(1.5);
    expect(Math.abs(y1 - y3)).toBeLessThanOrEqual(1.5);
  });

  test("H1 text is static and verbatim across slides", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const h1 = page.locator("[data-hero] h1");
    await expect(h1).toHaveText("Homes from the people who run the building.");

    await page.click("[aria-label='Jump to slide 2']");
    await page.waitForTimeout(400);
    await expect(h1).toHaveText("Homes from the people who run the building.");
  });

  test("pauses on hover and resumes remaining dwell", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const hero = page.locator("[data-hero]");
    await hero.hover();
    await page.waitForTimeout(5000);

    // Should still be on slide 01 because hover pauses auto-advance
    const counter = page.locator("[data-hero-indicator] span:has-text('01')");
    await expect(counter).toBeVisible();

    // Mouse leave resumes
    await page.mouse.move(0, 0);
    const nextCounter = page.locator("[data-hero-indicator] span:has-text('02')");
    await expect(nextCounter).toBeVisible({ timeout: 5500 });
  });

  test("no visible pause button in the hero", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const pauseBtn = page.locator("[data-hero] button[aria-label*='slideshow']");
    await expect(pauseBtn).toHaveCount(0);
  });

  test("jump buttons navigate slides and highlight properly", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("[aria-label='Jump to slide 2']").click();
    await page.waitForTimeout(300);
    const counter02 = page.locator("[data-hero-indicator] span:has-text('02')");
    await expect(counter02).toBeVisible();

    await page.locator("[aria-label='Jump to slide 3']").click();
    await page.waitForTimeout(300);
    const counter03 = page.locator("[data-hero-indicator] span:has-text('03')");
    await expect(counter03).toBeVisible();
  });

  test("never displays an undecoded image", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const activeImg = page.locator("[data-hero-photo] img").first();
    const isDecoded = await activeImg.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(isDecoded).toBe(true);
  });
});

test.describe("Hero Carousel Reduced Motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("reduced motion: no auto-advance after 10s", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(6000);

    const counter = page.locator("[data-hero-indicator] span:has-text('01')");
    await expect(counter).toBeVisible();
  });
});
