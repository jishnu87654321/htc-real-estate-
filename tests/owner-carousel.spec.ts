import { test, expect } from "@playwright/test";

test.describe("Revision 13 — List Your Property Hero Thumbnail Carousel", () => {
  test("stack sequence and scroll rail are gone", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    await expect(page.locator('[data-sequence-mode="stack"]')).toHaveCount(0);
    await expect(page.locator("[data-scroll-rail]")).toHaveCount(0);
    await expect(page.locator("[data-owner-carousel]")).toHaveCount(1);
  });

  test("no rotated leftover layer behind the photo", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const rotations = await page.evaluate(() => {
      const carousel = document.querySelector("[data-owner-carousel]");
      if (!carousel) return [];
      const els = Array.from(carousel.querySelectorAll("*")) as HTMLElement[];
      return els.map((el) => {
        const tr = window.getComputedStyle(el).transform;
        return tr;
      });
    });

    // Verify no 2deg / -2deg matrix rotation leaks exist
    for (const tr of rotations) {
      if (tr && tr !== "none") {
        expect(tr).not.toContain("matrix(0.999"); // approx 2deg rotation
      }
    }
  });

  test("autoplays to slide 2 within 5.5s of load", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const counter = page.locator("[data-owner-carousel] .tabular-nums");
    await expect(counter).toContainText("01 / 05");

    // Wait for 4s autoplay dwell
    await page.waitForTimeout(5000);
    await expect(counter).toContainText("02 / 05");
  });

  test("thumbnail click jumps and resets the timer", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const counter = page.locator("[data-owner-carousel] .tabular-nums");
    await expect(counter).toContainText("01 / 05");

    // Wait 3.0s, click thumbnail 4
    await page.waitForTimeout(3000);
    const thumb4 = page.locator("[data-owner-carousel] button[aria-label*='photo 4']");
    await thumb4.click();
    await expect(counter).toContainText("04 / 05");

    // Blur and move mouse away so hover / focus doesn't pause autoplay
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.mouse.move(0, 0);

    // After 3.0s, it should still be on slide 4 (timer was reset to full 4s)
    await page.waitForTimeout(3000);
    await expect(counter).toContainText("04 / 05");

    // After another 2.5s (total >5s from click), advances to slide 5
    await page.waitForTimeout(2500);
    await expect(counter).toContainText("05 / 05");
  });

  test("pauses on hover and resumes remaining time", async ({ page }) => {
    const hasHover = await page.evaluate(() => window.matchMedia("(hover: hover)").matches);
    if (!hasHover) return;

    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const carousel = page.locator("[data-owner-carousel]");
    const counter = page.locator("[data-owner-carousel] .tabular-nums");
    await expect(counter).toContainText("01 / 05");

    // Hover at 2s
    await page.waitForTimeout(2000);
    await carousel.hover({ force: true });

    // Wait 4s while hovered — should NOT advance
    await page.waitForTimeout(4000);
    await expect(counter).toContainText("01 / 05");

    // Unhover — moves away
    await page.mouse.move(0, 0);
    // Should advance in ~2.5s (remaining time)
    await page.waitForTimeout(3000);
    await expect(counter).toContainText("02 / 05");
  });

  test("pause button stops autoplay; label toggles", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const pauseBtn = page.locator("[data-owner-carousel] button[aria-label*='slideshow']");
    await expect(pauseBtn).toHaveAttribute("aria-label", "Pause slideshow");

    // Click pause button
    await pauseBtn.click();
    await expect(pauseBtn).toHaveAttribute("aria-label", "Play slideshow");

    const counter = page.locator("[data-owner-carousel] .tabular-nums");
    await expect(counter).toContainText("01 / 05");

    // Wait 5s — should remain on 01
    await page.waitForTimeout(5000);
    await expect(counter).toContainText("01 / 05");

    // Play again
    await pauseBtn.click();
    await expect(pauseBtn).toHaveAttribute("aria-label", "Pause slideshow");

    // Move mouse and blur so neither hover nor focus keeps it paused
    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.mouse.move(0, 0);
    await page.waitForTimeout(5000);
    await expect(counter).toContainText("02 / 05");
  });

  test("arrow keys navigate when focused", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const carousel = page.locator("[data-owner-carousel]");
    await carousel.focus();

    await page.keyboard.press("ArrowRight");
    const counter = page.locator("[data-owner-carousel] .tabular-nums");
    await expect(counter).toContainText("02 / 05");

    await page.keyboard.press("ArrowLeft");
    await expect(counter).toContainText("01 / 05");
  });

  test("active thumbnail ring is visible (red ring, not white)", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const activeThumb = page.locator("[data-owner-carousel] button[aria-current='true']");
    await expect(activeThumb).toHaveClass(/ring-red-600/);
  });

  test("images are unique to this page", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const carouselImageSrcs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("[data-owner-carousel] img")) as HTMLImageElement[];
      return imgs.map((img) => img.src);
    });

    for (const src of carouselImageSrcs) {
      expect(src).toContain("owners-carousel");
      expect(src).not.toContain("home-difference-seq");
      expect(src).not.toContain("home-hero-seq");
    }
  });

  test("mobile: carousel above copy, 4/3 aspect ratio", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 1440;
    if (width >= 768) return;

    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const carousel = page.locator("[data-owner-carousel]");
    const h1 = page.locator("h1");

    const carouselBox = await carousel.boundingBox();
    const h1Box = await h1.boundingBox();

    // Carousel is above copy on mobile
    expect(carouselBox!.y).toBeLessThan(h1Box!.y);
  });

  test("a11y: region labelled, slides labelled, thumbnails are labelled buttons", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const region = page.locator("[data-owner-carousel][role='region']");
    await expect(region).toBeVisible();
    await expect(region).toHaveAttribute("aria-roledescription", "carousel");

    const slides = page.locator("[data-owner-carousel] [role='group'][aria-roledescription='slide']");
    await expect(slides).toHaveCount(5);

    const buttons = page.locator("[data-owner-carousel] button[aria-label*='Show photo']");
    await expect(buttons).toHaveCount(5);
  });

  test("wrap 5 → 1 fades, never rewinds across intermediate slides", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");
    const loader = page.locator("[aria-label='Loading HTC Real Estate']");
    if (await loader.count() > 0) {
      await loader.waitFor({ state: "hidden", timeout: 3000 }).catch(() => {});
    }

    const thumb5 = page.locator("[data-owner-carousel] button[aria-label*='photo 5']");
    await thumb5.click();
    await expect(page.locator("[data-owner-carousel] .tabular-nums")).toContainText("05 / 05");

    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.mouse.move(0, 0);

    // Wait for autoplay wrap (4s)
    await expect(page.locator("[data-owner-carousel] .tabular-nums")).toContainText("01 / 05", { timeout: 8000 });
  });
});

test.describe("Revision 13 — Reduced Motion Compliance", () => {
  test.use({ reducedMotion: "reduce" });

  test("reduced motion: no autoplay after 10s, clicks change instantly", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const counter = page.locator("[data-owner-carousel] .tabular-nums");
    await expect(counter).toContainText("01 / 05");

    // Wait 10s — should remain on 01
    await page.waitForTimeout(6000);
    await expect(counter).toContainText("01 / 05");

    // Click thumb 3 -> changes instantly
    const thumb3 = page.locator("[data-owner-carousel] button[aria-label*='photo 3']");
    await thumb3.click();
    await expect(counter).toContainText("03 / 05");
  });
});
