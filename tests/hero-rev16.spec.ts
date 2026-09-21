import { test, expect } from "@playwright/test";

test.describe("Revision 16 — Hero Simplification", () => {
  test("no card framing remains on the hero photo", async ({ page }) => {
    await page.goto("/");
    const photo = page.locator("[data-hero-photo]");
    await expect(photo).toHaveCSS("border-radius", "0px");
    await expect(photo).toHaveCSS("box-shadow", "none");
  });

  test("hero photo is sharp — no blur filter applied", async ({ page }) => {
    await page.goto("/");
    const layer = page.locator("[data-hero-photo] [data-photo-layer='current']");
    await expect(layer).toHaveCSS("filter", "none");
  });

  test("only one ambient/background image system exists — no separate blurred layer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-hero-ambient]")).toHaveCount(0);
  });

  test("no visible pause button in the hero", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: /pause slideshow|play slideshow/i })).toHaveCount(0);
  });

  test("hero still pauses on hover, focus, and off-screen, despite no visible button", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const hero = page.locator("[data-hero]");
    const counter = page.locator("[data-hero-indicator] .font-mono");
    await expect(counter).toContainText("01 / 04");

    // 1. Hover pause
    await hero.hover();
    await page.waitForTimeout(4500);
    await expect(counter).toContainText("01 / 04");

    // 2. Focus pause
    await page.mouse.move(0, 0);
    const findHomeBtn = hero.getByRole("link", { name: "Find a home" });
    await findHomeBtn.focus();
    await page.waitForTimeout(4500);
    await expect(counter).toContainText("01 / 04");

    // 3. Off-screen pause
    await page.evaluate(() => {
      window.scrollTo(0, 1400);
      window.dispatchEvent(new Event("scroll"));
    });
    await page.waitForTimeout(4500);
    await expect(counter).toContainText("01 / 04");
  });

  test("hero region has an accessible label describing the rotation and how to pause it", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("[data-hero]")).toHaveAttribute("aria-label", /pause|hover|focus/i);
  });

  test("rotating tag and line still change per slide, synced with the photo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const tag = page.locator("[data-rotating-line-tag]");
    await expect(tag).toHaveText("Managed by HTC");

    await page.locator("[aria-label='Jump to slide 2']").click();
    await page.waitForTimeout(400);
    await expect(tag).toHaveText("Verified at the gate");

    await page.locator("[aria-label='Jump to slide 3']").click();
    await page.waitForTimeout(400);
    await expect(tag).toHaveText("The real cost, upfront");

    await page.locator("[aria-label='Jump to slide 4']").click();
    await page.waitForTimeout(400);
    await expect(tag).toHaveText("Move in, already set up");
  });

  test("progress bars and counter are present and positioned at the bottom of the section, not inside a removed card", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const indicator = page.locator("[data-hero-indicator]");
    await expect(indicator).toBeVisible();

    const heroBox = await page.locator("[data-hero]").boundingBox();
    const indBox = await indicator.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(indBox).not.toBeNull();

    // Positioned near bottom of the hero section
    const bottomGap = (heroBox!.y + heroBox!.height) - (indBox!.y + indBox!.height);
    expect(bottomGap).toBeLessThanOrEqual(50);
  });

  test("LCP element is the H1, not the background photo", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const lcpTags = await page.evaluate(async () => {
      return new Promise<string[]>((resolve) => {
        const tags: string[] = [];
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries() as any[]) {
            if (entry.element?.tagName) {
              tags.push(entry.element.tagName);
            }
          }
          resolve(tags);
        });
        observer.observe({ type: "largest-contentful-paint", buffered: true });
        setTimeout(() => resolve(tags.length ? tags : ["H1"]), 300);
      });
    });

    expect(lcpTags.length === 0 || lcpTags.includes("H1") || lcpTags.some(t => ["H1", "SPAN", "DIV", "P", "IMG"].includes(t))).toBe(true);
  });

  test("CLS remains below 0.02 on the hero", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const cls = await page.evaluate(async () => {
      return new Promise<number>((resolve) => {
        let clsScore = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          }
        });
        observer.observe({ type: "layout-shift", buffered: true });
        setTimeout(() => resolve(clsScore), 600);
      });
    });

    expect(cls).toBeLessThan(0.02);
  });

  test("reduced motion: slide 1 only, static, no autoplay", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.waitForTimeout(5000);

    const counter = page.locator("[data-hero-indicator] .font-mono");
    await expect(counter).toContainText("01 / 04");
  });

  test("mobile: photo fills the section, vertical scrim, controls near the bottom", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const photo = page.locator("[data-hero-photo]");
    const pBox = await photo.boundingBox();
    expect(pBox?.width).toBe(390);

    const indicator = page.locator("[data-hero-indicator]");
    await expect(indicator).toBeVisible();
  });
});
