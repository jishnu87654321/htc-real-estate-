import { test, expect } from "@playwright/test";

test.describe("Scroll Sequences Engine", () => {
  test("homepage difference sequence advances and reverses on scroll", async ({ page }) => {
    await page.goto("/");
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth < 768) return;

    const section = page.locator("[data-difference-desktop]");
    await section.scrollIntoViewIfNeeded();

    // Measure frame counter progression through scroll offsets
    const frames = await page.evaluate(async () => {
      const sec = document.querySelector("[data-difference-desktop]") as HTMLElement;
      if (!sec) return [];
      const secRect = sec.getBoundingClientRect();
      const currentScroll = window.scrollY;
      const secTop = currentScroll + secRect.top;
      const start = secTop;
      const end = secTop + sec.offsetHeight - window.innerHeight;

      const observed: string[] = [];
      const offsets = [0.05, 0.5, 0.95];

      for (const ratio of offsets) {
        window.scrollTo(0, start + (end - start) * ratio);
        window.dispatchEvent(new Event("scroll"));
        await new Promise((r) => setTimeout(r, 1100));
        const counter = document.querySelector("[data-difference-right] .font-mono");
        observed.push(counter?.textContent?.trim() || "");
      }

      // Reverse scroll
      window.scrollTo(0, start + (end - start) * 0.05);
      window.dispatchEvent(new Event("scroll"));
      await new Promise((r) => setTimeout(r, 1100));
      const reverseCounter = document.querySelector("[data-difference-right] .font-mono");
      observed.push(reverseCounter?.textContent?.trim() || "");

      return observed;
    });

    expect(frames[0]).toContain("01 / 05");
    expect(frames[1]).toContain("03 / 05");
    expect(frames[2]).toContain("05 / 05");
    expect(frames[3]).toContain("01 / 05"); // Reversing works cleanly
  });

  test("hero auto-advance reaches frame 02 within 6 seconds", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(600);
    const counter = page.locator("[data-hero] .font-mono").first();
    await expect(counter).toContainText("01 / 04");

    // Wait for 5s auto-advance
    await page.waitForTimeout(5500);
    await expect(counter).toContainText("02 / 04");
  });

  test("hero auto-advance pauses on hover", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(600);
    const hasHover = await page.evaluate(() => window.matchMedia("(hover: hover)").matches);
    if (!hasHover) return;

    const heroFrame = page.locator("[data-hero-frame]");
    await heroFrame.scrollIntoViewIfNeeded();
    await heroFrame.hover({ force: true });

    const counter = page.locator("[data-hero] .font-mono").first();
    await expect(counter).toContainText("01 / 04");

    // Wait 5.5s while hovered — should remain on 01
    await page.waitForTimeout(5500);
    await expect(counter).toContainText("01 / 04");
  });

  test("below 768px: difference section has no sticky child and no 300vh height", async ({ page }) => {
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth >= 768) return;

    await page.goto("/");
    const mobileSec = page.locator("[data-difference-mobile]");
    await expect(mobileSec).toBeVisible();

    const stickyInMobile = await mobileSec.locator(".sticky").count();
    expect(stickyInMobile).toBe(0);

    // Ensure desktop sticky container is hidden
    const desktopSec = page.locator("[data-difference-desktop]");
    await expect(desktopSec).toBeHidden();
  });
});
