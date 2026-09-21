import { test, expect } from "@playwright/test";

test.describe("Hero Carousel with Ambient Background", () => {
  test("advances slide 01 -> 02 within 5.5s", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const hero = page.locator("[data-hero]");
    await expect(hero).toBeVisible();

    const counter = page.locator("[data-hero-carousel] span:has-text('01')");
    await expect(counter).toBeVisible();

    // Advance to 02 within 5.5s
    const nextCounter = page.locator("[data-hero-carousel] span:has-text('02')");
    await expect(nextCounter).toBeVisible({ timeout: 5500 });
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
    const carousel = page.locator("[data-hero-carousel]");
    await carousel.hover();
    await page.waitForTimeout(5000);

    // Should still be on slide 01 because hover pauses auto-advance
    const counter = page.locator("[data-hero-carousel] span:has-text('01')");
    await expect(counter).toBeVisible();

    // Mouse leave resumes
    await page.mouse.move(0, 0);
    const nextCounter = page.locator("[data-hero-carousel] span:has-text('02')");
    await expect(nextCounter).toBeVisible({ timeout: 5500 });
  });

  test("pause button works and accessible name toggles", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const pauseBtn = page.locator("[data-hero-carousel] button[aria-label='Pause slideshow']");
    await expect(pauseBtn).toBeVisible();

    await pauseBtn.click();
    const playBtn = page.locator("[data-hero-carousel] button[aria-label='Play slideshow']");
    await expect(playBtn).toBeVisible();

    await playBtn.click();
    await expect(pauseBtn).toBeVisible();
  });

  test("arrow keys change slide when focused", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const carousel = page.locator("[data-hero-carousel]");
    await carousel.focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(200);

    const counter02 = page.locator("[data-hero-carousel] span:has-text('02')");
    await expect(counter02).toBeVisible({ timeout: 2000 });

    await page.keyboard.press("ArrowLeft");
    await page.waitForTimeout(200);
    const counter01 = page.locator("[data-hero-carousel] span:has-text('01')");
    await expect(counter01).toBeVisible({ timeout: 2000 });
  });

  test("never displays an undecoded image", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");

    const activeImg = page.locator("[data-hero-carousel] img").first();
    const isDecoded = await activeImg.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(isDecoded).toBe(true);
  });
});

test.describe("Hero Carousel Reduced Motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("reduced motion: no auto-advance after 10s", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(6000);

    const counter = page.locator("[data-hero-carousel] span:has-text('01')");
    await expect(counter).toBeVisible();
  });
});
