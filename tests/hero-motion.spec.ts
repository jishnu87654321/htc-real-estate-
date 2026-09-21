import { test, expect } from "@playwright/test";

test.describe("Hero Parallax & Motion", () => {
  test("hero copy recedes and fades as page scrolls away", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator("[data-hero]").waitFor();
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth < 768) return;

    // Measure at initial scroll = 0
    const initialStyles = await page.evaluate(() => {
      const copy = document.querySelector("[data-hero] h1")?.parentElement as HTMLElement;
      if (!copy) return null;
      const s = window.getComputedStyle(copy);
      return {
        opacity: parseFloat(s.opacity) || 1,
        transform: s.transform,
      };
    });

    expect(initialStyles).not.toBeNull();
    expect(initialStyles!.opacity).toBeCloseTo(1, 1);

    // Scroll down to near hero exit (85% of hero height)
    await page.evaluate(async () => {
      const hero = document.querySelector("[data-hero]") as HTMLElement;
      const heroH = hero ? hero.offsetHeight : 800;
      window.scrollTo(0, heroH * 0.85);
      window.dispatchEvent(new Event("scroll"));
      await new Promise((r) => setTimeout(r, 200));
    });

    const scrolledStyles = await page.evaluate(() => {
      const copy = document.querySelector("[data-hero] h1")?.parentElement as HTMLElement;
      if (!copy) return null;

      const cStyle = window.getComputedStyle(copy);

      return {
        copyOpacity: parseFloat(cStyle.opacity),
        copyTransform: cStyle.transform,
      };
    });

    expect(scrolledStyles).not.toBeNull();
    // Copy fades into page (< 0.60)
    expect(scrolledStyles!.copyOpacity).toBeLessThanOrEqual(0.6);
  });

  test("scroll cue is visible initially and fades out on scroll", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.locator("[data-hero]").waitFor();
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth < 768) return;

    // Scroll past hero entrance (e.g. 600px)
    const result = await page.evaluate(async () => {
      const hero = document.querySelector("[data-hero]") as HTMLElement;
      const heroH = hero ? hero.offsetHeight : 800;
      window.scrollTo(0, heroH * 0.8);
      window.dispatchEvent(new Event("scroll"));
      await new Promise((r) => setTimeout(r, 200));

      const cue = document.querySelector("[data-scroll-cue]") as HTMLElement;
      return {
        scrollY: window.scrollY,
        heroH,
        opacity: cue ? parseFloat(window.getComputedStyle(cue).opacity) : 1,
      };
    });

    expect(result.opacity).toBeLessThanOrEqual(0.2);
  });
});
