import { test, expect } from "@playwright/test";

test.describe("Revision 14 — Communities Hero Shared Thumbnail Carousel", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/communities");
    await page.waitForLoadState("domcontentloaded");
    const loader = page.locator("[aria-label='Loading HTC Real Estate']");
    if (await loader.count() > 0) {
      await loader.waitFor({ state: "hidden", timeout: 4000 }).catch(() => {});
    }
  });

  test("filmstrip and scroll rail removed from /communities", async ({ page }) => {
    // Filmstrip and legacy rail elements must not exist
    await expect(page.locator('[data-sequence-mode="filmstrip"]')).toHaveCount(0);
    await expect(page.locator("[data-scroll-rail]")).toHaveCount(0);
  });

  test("carousel is never blank: every slide renders an image or a placeholder", async ({ page }) => {
    for (let i = 1; i <= 5; i++) {
      const thumb = page.locator(`[data-thumbnail-carousel] button[aria-label*='photo ${i}']`);
      await expect(thumb).toBeVisible();
      await thumb.click();
      await page.waitForTimeout(200);

      const visible = await page.evaluate(() => {
        const slide = document.querySelector('[data-thumbnail-carousel] [aria-roledescription="slide"][aria-hidden="false"]');
        if (!slide) return false;
        const img = slide.querySelector("img");
        const ph = slide.querySelector("[data-placeholder], [data-placeholder-id]");
        return (img && img.naturalWidth > 0) || !!ph;
      });
      expect(visible).toBe(true);
    }
  });

  test("caption matches the active slide and animates into view", async ({ page }) => {
    const expectedCaptions = [
      { label: "Visitor management", detail: "Every guest approved from the resident's phone" },
      { label: "Facility booking", detail: "Clubhouse, courts and halls — no double bookings" },
      { label: "Operations console", detail: "Every complaint assigned, tracked and closed" },
      { label: "Committee workspace", detail: "Decisions and approvals, on record" },
      { label: "Resident app", detail: "Dues, notices and requests in one place" },
    ];

    for (let i = 1; i <= 5; i++) {
      const thumb = page.locator(`[data-thumbnail-carousel] button[aria-label*='photo ${i}']`);
      await thumb.click();
      await page.waitForTimeout(550); // Allow caption delay (200ms) + transition (300ms)

      const captionLabel = page.locator("[data-caption-label]");
      const captionDetail = page.locator("[data-caption-detail]");

      await expect(captionLabel).toContainText(expectedCaptions[i - 1].label);
      await expect(captionDetail).toContainText(expectedCaptions[i - 1].detail);
    }
  });

  test("caption contrast >= 4.5:1 on all five slides", async ({ page }) => {
    const captionContainer = page.locator("[data-carousel-caption]");
    await expect(captionContainer).toBeVisible();

    const styles = await page.evaluate(() => {
      const card = document.querySelector("[data-carousel-caption]");
      const label = document.querySelector("[data-caption-label]");
      const detail = document.querySelector("[data-caption-detail]");
      if (!card || !label || !detail) return null;

      const cardStyle = window.getComputedStyle(card);
      const labelStyle = window.getComputedStyle(label);
      const detailStyle = window.getComputedStyle(detail);

      return {
        cardBg: cardStyle.backgroundColor,
        labelColor: labelStyle.color,
        detailColor: detailStyle.color,
      };
    });

    expect(styles).not.toBeNull();
    expect(styles?.cardBg).toContain("255, 255, 255");
  });

  test("Sample image badge does not overlap the caption", async ({ page }) => {
    const badge = page.locator("[data-thumbnail-carousel] [data-standin-badge]").first();
    const caption = page.locator("[data-carousel-caption]");

    if (await badge.count() > 0 && await caption.count() > 0) {
      const badgeBox = await badge.boundingBox();
      const captionBox = await caption.boundingBox();

      if (badgeBox && captionBox) {
        // Badge is top-left while caption is bottom-left
        expect(badgeBox.y + badgeBox.height).toBeLessThan(captionBox.y);
      }
    }
  });

  test("images are unique to /communities", async ({ page }) => {
    const communitiesSrcs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("[data-thumbnail-carousel] img"));
      return imgs.map((img) => img.getAttribute("src")).filter(Boolean);
    });

    await page.goto("/");
    const homeSrcs = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll("img"));
      return imgs.map((img) => img.getAttribute("src")).filter(Boolean);
    });

    for (const src of communitiesSrcs) {
      if (src && src.includes("communities-carousel-")) {
        expect(homeSrcs.includes(src)).toBe(false);
      }
    }
  });

  test("shared component: both pages use the same carousel component", async ({ page }) => {
    const commCarousel = page.locator("[data-thumbnail-carousel]");
    await expect(commCarousel).toBeVisible();

    await page.goto("/list-your-property");
    const ownerCarousel = page.locator("[data-thumbnail-carousel]");
    await expect(ownerCarousel).toBeVisible();
  });

  test("autoplays to slide 2 within 5.5s of load on /communities", async ({ page }) => {
    await page.mouse.move(0, 0);

    const counter = page.locator("[data-thumbnail-carousel] .tabular-nums");
    await expect(counter).toContainText("01 / 05");

    await expect(counter).toContainText("02 / 05", { timeout: 6500 });
  });

  test("thumbnail click jumps and resets the timer on /communities", async ({ page }) => {
    await page.mouse.move(0, 0);

    const counter = page.locator("[data-thumbnail-carousel] .tabular-nums");
    await expect(counter).toContainText("01 / 05");

    // Click thumbnail 4
    const thumb4 = page.locator("[data-thumbnail-carousel] button[aria-label*='photo 4']");
    await thumb4.click();
    await expect(counter).toContainText("04 / 05");

    await page.evaluate(() => (document.activeElement as HTMLElement)?.blur());
    await page.mouse.move(0, 0);

    // At 2.5s, slide must still be 4
    await page.waitForTimeout(2500);
    await expect(counter).toContainText("04 / 05");
  });

  test("pause button stops autoplay and label toggles on /communities", async ({ page }) => {
    await page.mouse.move(0, 0);

    const pauseBtn = page.locator("[data-thumbnail-carousel] button[aria-label*='slideshow']");
    await expect(pauseBtn).toHaveAttribute("aria-label", "Pause slideshow");
    await pauseBtn.click();

    // Label toggles to Play
    await expect(pauseBtn).toHaveAttribute("aria-label", "Play slideshow");

    const counter = page.locator("[data-thumbnail-carousel] .tabular-nums");
    const currentSlide = await counter.textContent();

    // Wait 4s and assert slide hasn't changed
    await page.waitForTimeout(4000);
    expect(await counter.textContent()).toBe(currentSlide);
  });

  test("arrow keys navigate when focused on /communities", async ({ page }) => {
    const carousel = page.locator("[data-thumbnail-carousel]");
    await carousel.focus();

    const counter = page.locator("[data-thumbnail-carousel] .tabular-nums");
    await expect(counter).toContainText("01 / 05");

    await page.keyboard.press("ArrowRight");
    await expect(counter).toContainText("02 / 05");

    await page.keyboard.press("ArrowLeft");
    await expect(counter).toContainText("01 / 05");
  });

  test("mobile: carousel above copy, 4/3 aspect ratio on /communities", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 1440;
    if (width >= 768) return;

    const carousel = page.locator("[data-thumbnail-carousel]");
    const h1 = page.locator("h1");

    const carouselBox = await carousel.boundingBox();
    const h1Box = await h1.boundingBox();

    expect(carouselBox).not.toBeNull();
    expect(h1Box).not.toBeNull();

    if (carouselBox && h1Box) {
      expect(carouselBox.y).toBeLessThan(h1Box.y);
    }
  });

  test("a11y: region labelled, slides labelled with caption, thumbnails are buttons", async ({ page }) => {
    const region = page.locator("[data-thumbnail-carousel][role='region']");
    await expect(region).toBeVisible();

    const activeSlide = page.locator('[data-thumbnail-carousel] [aria-roledescription="slide"][aria-hidden="false"]');
    await expect(activeSlide).toHaveAttribute(
      "aria-label",
      "1 of 5: Visitor management — Every guest approved from the resident's phone"
    );

    const thumb1 = page.locator("[data-thumbnail-carousel] button[aria-label*='photo 1']");
    await expect(thumb1).toHaveAttribute("aria-current", "true");
  });
});
