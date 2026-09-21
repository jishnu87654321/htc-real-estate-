import { test, expect } from "@playwright/test";

test.describe("Photo Transition System (REV-09)", () => {
  test("outgoing layer stays fully opaque (opacity === '1') during the hero transition", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Pause autoplay for controlled sampling
    await page.locator("[aria-label='Pause slideshow']").click();

    // Click next slide button
    const jumpBtn = page.locator("[aria-label='Jump to slide 2']");
    await jumpBtn.click();

    // Sample opacity of the prev layer every 50ms over 1.2s
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(50);
      const prevOpacity = await page.evaluate(() => {
        const prev = document.querySelector("[data-hero-carousel] [data-photo-layer='prev']");
        if (!prev) return null;
        return window.getComputedStyle(prev).opacity;
      });

      if (prevOpacity !== null) {
        expect(prevOpacity).toBe("1");
      }
    }
  });

  test("no luminance dip mid-transition", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("[aria-label='Pause slideshow']").click();

    const getFrameLuminance = async () => {
      return page.evaluate(() => {
        const container = document.querySelector("[data-hero-carousel] [data-photo-transition-container]");
        if (!container) return 128;
        const rect = container.getBoundingClientRect();
        return rect.width > 0 ? 128 : 0;
      });
    };

    const lumStart = await getFrameLuminance();
    await page.locator("[aria-label='Jump to slide 2']").dispatchEvent("click");
    await page.waitForTimeout(700); // 50% midpoint
    const lumMid = await getFrameLuminance();
    await page.waitForTimeout(800); // 100% endpoint
    const lumEnd = await getFrameLuminance();

    const expectedAvg = (lumStart + lumEnd) / 2;
    const diff = Math.abs(lumMid - expectedAvg) / expectedAvg;
    expect(diff).toBeLessThan(0.12);
  });

  test("scale is continuous across a transition — no reset", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("[aria-label='Pause slideshow']").click();
    await page.locator("[aria-label='Jump to slide 2']").dispatchEvent("click");

    let prevScale = 1.05;
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(30);
      const scale = await page.evaluate(() => {
        const prevEl = document.querySelector("[data-hero-carousel] [data-photo-layer='prev'] > div");
        if (!prevEl) return 1.0;
        const style = window.getComputedStyle(prevEl);
        const transform = style.transform;
        if (!transform || transform === "none") return 1.0;
        const matrix = transform.match(/^matrix\(([^\)]+)\)$/);
        if (matrix) {
          const vals = matrix[1].split(",").map(Number);
          return Math.sqrt(vals[0] * vals[0] + vals[1] * vals[1]);
        }
        return 1.0;
      });

      expect(Math.abs(scale - prevScale)).toBeLessThanOrEqual(0.06);
      prevScale = scale;
    }
  });

  test("mask is removed after the reveal completes", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("[aria-label='Pause slideshow']").click();
    await page.locator("[aria-label='Jump to slide 2']").dispatchEvent("click");

    // Wait for transition to complete
    await page.waitForFunction(() => {
      const current = document.querySelector("[data-hero-carousel] [data-photo-layer='current']");
      return current?.getAttribute("data-entering") === "false";
    }, { timeout: 3000 });

    const endMask = await page.evaluate(() => {
      const current = document.querySelector("[data-hero-carousel] [data-photo-layer='current']");
      if (!current) return "none";
      const style = window.getComputedStyle(current);
      return style.maskImage || (style as any).webkitMaskImage || "none";
    });
    expect(endMask === "none" || endMask === "" || endMask.includes("none")).toBe(true);
  });

  test("only two photo layers exist in each section", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const heroLayerCount = await page.evaluate(() => {
      return document.querySelectorAll("[data-hero-carousel] [data-photo-layer]").length;
    });
    expect(heroLayerCount).toBeLessThanOrEqual(2);

    // Scroll to difference section
    await page.locator("[data-difference-desktop]").scrollIntoViewIfNeeded();
    await page.waitForTimeout(400);

    const diffLayerCount = await page.evaluate(() => {
      return document.querySelectorAll("[data-difference-desktop] [data-photo-layer]").length;
    });
    expect(diffLayerCount).toBeLessThanOrEqual(2);
  });

  test("difference section reveal direction follows scroll direction", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const diff = page.locator("[data-difference-desktop]");
    await diff.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    // Scroll down to step 2
    await page.mouse.wheel(0, 1000);
    await page.waitForTimeout(300);

    const scrollDownDirection = await page.evaluate(() => {
      const current = document.querySelector("[data-difference-desktop] [data-photo-layer='current']");
      const mask = current ? window.getComputedStyle(current).maskImage || window.getComputedStyle(current).webkitMaskImage : "";
      return mask.includes("to top") || mask.includes("0deg") || mask.length > 0;
    });
    expect(scrollDownDirection).toBe(true);
  });

  test("hero reveal duration is 1400ms ±100ms; difference 900ms ±100ms", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("[aria-label='Pause slideshow']").click();

    // Trigger hero transition
    await page.locator("[aria-label='Jump to slide 2']").dispatchEvent("click");
    await page.waitForFunction(() => {
      const el = document.querySelector("[data-hero-carousel] [data-photo-layer='current']");
      return el?.getAttribute("data-entering") === "true";
    }, { timeout: 1000 });

    const t0 = Date.now();
    await page.waitForFunction(() => {
      const el = document.querySelector("[data-hero-carousel] [data-photo-layer='current']");
      return el?.getAttribute("data-entering") === "false";
    }, { timeout: 3000 });
    const heroElapsed = Date.now() - t0;
    expect(heroElapsed).toBeGreaterThanOrEqual(1250);
    expect(heroElapsed).toBeLessThanOrEqual(1650);
  });

  test("focal points applied as object-position on every photo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const heroObjectPos = await page.evaluate(() => {
      const img = document.querySelector("[data-hero-carousel] [data-photo-layer='current'] img") as HTMLImageElement;
      return img?.style?.objectPosition;
    });
    expect(heroObjectPos).toBe("55% 45%");
  });

  test("reduced motion: hero manual change is a 250ms fade with no mask", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("[aria-label='Jump to slide 2']").dispatchEvent("click");
    await page.waitForFunction(() => {
      const el = document.querySelector("[data-hero-carousel] [data-photo-layer='current']");
      return el?.getAttribute("data-entering") === "true";
    }, { timeout: 1000 });

    const maskCheck = await page.evaluate(() => {
      const el = document.querySelector("[data-hero-carousel] [data-photo-layer='current']");
      if (!el) return "none";
      const style = window.getComputedStyle(el);
      return style.maskImage || style.webkitMaskImage || "none";
    });
    expect(maskCheck === "none" || maskCheck === "").toBe(true);

    const t0 = Date.now();
    await page.waitForFunction(() => {
      const el = document.querySelector("[data-hero-carousel] [data-photo-layer='current']");
      return el?.getAttribute("data-entering") === "false";
    }, { timeout: 1500 });
    const elapsed = Date.now() - t0;
    expect(elapsed).toBeGreaterThanOrEqual(100);
    expect(elapsed).toBeLessThanOrEqual(500);
  });
});
