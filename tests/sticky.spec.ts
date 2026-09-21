import { test, expect } from "@playwright/test";

test.describe("Difference Section — Sticky Regression Guards", () => {
  test("sticky container fits within the viewport height on desktop", async ({ page }) => {
    await page.goto("/");
    const vWidth = page.viewportSize()?.width ?? 1440;
    const sticky = page.locator("[data-difference-desktop] [data-sticky-container]");

    if (vWidth < 768) {
      // Below 768px: desktop sticky container should not be visible
      const isVisible = await sticky.isVisible();
      expect(isVisible).toBe(false);
      return;
    }

    await sticky.scrollIntoViewIfNeeded();
    const box = await sticky.boundingBox();
    const vh = page.viewportSize()!.height;
    expect(box).not.toBeNull();
    expect(box!.height).toBeLessThanOrEqual(vh); // R2-02
  });

  test("left column never exceeds available sticky height on desktop", async ({ page }) => {
    await page.goto("/");
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth < 768) return;

    const sticky = page.locator("[data-difference-desktop] [data-sticky-container]");
    await sticky.scrollIntoViewIfNeeded();
    const leftCol = page.locator("[data-difference-desktop] [data-difference-left]");
    const leftBox = await leftCol.boundingBox();
    const stickyBox = await sticky.boundingBox();

    expect(leftBox).not.toBeNull();
    expect(stickyBox).not.toBeNull();
    expect(leftBox!.height).toBeLessThanOrEqual(stickyBox!.height);
  });

  test("no ancestor blocks position:sticky", async ({ page }) => {
    await page.goto("/");
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth < 768) return;

    const blockers = await page.evaluate(() => {
      const blockersFound: { tag: string; classes: string; reasons: Record<string, string> }[] = [];
      let el = document.querySelector("[data-difference-desktop] [data-sticky-container]");
      while (el && el !== document.body) {
        const s = window.getComputedStyle(el);
        const reasons: Record<string, string> = {};
        if (s.overflow !== "visible") reasons.overflow = s.overflow;
        if (s.overflowX !== "visible") reasons.overflowX = s.overflowX;
        if (s.overflowY !== "visible") reasons.overflowY = s.overflowY;
        if (s.transform !== "none") reasons.transform = s.transform;
        if (s.filter !== "none") reasons.filter = s.filter;
        if (s.willChange !== "auto" && s.willChange !== "") reasons.willChange = s.willChange;
        if (s.contain !== "none") reasons.contain = s.contain;
        if (s.perspective !== "none") reasons.perspective = s.perspective;

        if (Object.keys(reasons).length > 0) {
          blockersFound.push({
            tag: el.tagName.toLowerCase(),
            classes: el.className,
            reasons,
          });
        }
        el = el.parentElement;
      }
      return blockersFound;
    });

    expect(blockers).toEqual([]);
  });

  test("sticky actually holds position across scroll", async ({ page }) => {
    await page.goto("/");
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth < 768) return;

    const section = page.locator("[data-difference-desktop]");
    await section.scrollIntoViewIfNeeded();

    const header = page.locator("header");
    const headerBox = await header.boundingBox();
    const headerHeight = headerBox ? headerBox.height : 72;

    const positions = await page.evaluate(async (headerH) => {
      const sec = document.querySelector("[data-difference-desktop]") as HTMLElement;
      if (!sec) return [];
      const secRect = sec.getBoundingClientRect();
      const currentScroll = window.scrollY;
      const secTop = currentScroll + secRect.top;
      const pinStart = secTop - headerH;
      const pinEnd = secTop + sec.offsetHeight - window.innerHeight;

      const yCoords: number[] = [];
      const offsets = [0.25, 0.5, 0.75];

      for (const ratio of offsets) {
        const targetScroll = pinStart + (pinEnd - pinStart) * ratio;
        window.scrollTo(0, targetScroll);
        await new Promise((r) => setTimeout(r, 100));
        const st = document.querySelector("[data-difference-desktop] [data-sticky-container]");
        if (st) {
          yCoords.push(st.getBoundingClientRect().top);
        }
      }
      return yCoords;
    }, headerHeight);

    expect(positions.length).toBe(3);
    for (const y of positions) {
      // While scrolled inside the section's active pinning range, top stays at 72px (--header-h)
      expect(Math.abs(y - 72)).toBeLessThanOrEqual(3);
    }
  });

  test("difference heading never overlaps the trust strip", async ({ page }) => {
    await page.goto("/");
    const overlaps = await page.evaluate(async () => {
      const heading = document.querySelector("[data-difference-left] h2") || document.querySelector("[data-difference] h2");
      const trustStrip = document.querySelector("section.bg-surface-brand");
      if (!heading || !trustStrip) return false;

      for (let i = 0; i < 10; i++) {
        window.scrollTo(0, 300 + i * 150);
        await new Promise((r) => setTimeout(r, 50));
        const hBox = heading.getBoundingClientRect();
        const tBox = trustStrip.getBoundingClientRect();

        const intersects = !(
          hBox.right < tBox.left ||
          hBox.left > tBox.right ||
          hBox.bottom < tBox.top ||
          hBox.top > tBox.bottom
        );

        if (intersects && hBox.height > 0 && tBox.height > 0) {
          return true;
        }
      }
      return false;
    });

    expect(overlaps).toBe(false); // R2-01
  });

  test("left and right columns are vertically centre-aligned", async ({ page }) => {
    await page.goto("/");
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth < 768) return;

    const sticky = page.locator("[data-difference-desktop] [data-sticky-container]");
    await sticky.scrollIntoViewIfNeeded();

    const alignment = await page.evaluate(() => {
      const left = document.querySelector("[data-difference-desktop] [data-difference-left]");
      const right = document.querySelector("[data-difference-desktop] [data-difference-right]");
      if (!left || !right) return null;

      const lRect = left.getBoundingClientRect();
      const rRect = right.getBoundingClientRect();

      const leftCenterY = lRect.top + lRect.height / 2;
      const rightCenterY = rRect.top + rRect.height / 2;

      return Math.abs(leftCenterY - rightCenterY);
    });

    expect(alignment).not.toBeNull();
    expect(alignment!).toBeLessThanOrEqual(8); // R2-03
  });
});
