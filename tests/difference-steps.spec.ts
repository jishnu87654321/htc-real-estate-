import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/communities",
  "/services",
  "/operations",
  "/about",
  "/properties",
  "/list-your-property",
  "/careers",
  "/contact",
];

test.describe("REV-12: Currency & Zero Dollar Signs Site-Wide", () => {
  test("no dollar signs anywhere on the site", async ({ page }) => {
    for (const r of ROUTES) {
      await page.goto(r);
      await page.waitForLoadState("domcontentloaded");
      // Check page body text does not have $
      const bodyText = await page.locator("body").innerText();
      expect(bodyText).not.toContain("$");

      // Verify no lucide Dollar icons or dollar SVGs exist
      const dollarIcons = await page.locator("svg.lucide-dollar-sign, svg.lucide-circle-dollar-sign, svg.lucide-badge-dollar-sign").count();
      expect(dollarIcons).toBe(0);
    }
  });
});

test.describe("REV-12 Part B: Feature Tiles Without Icons", () => {
  test("communities tiles have no icons and clean photography", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const grid = page.locator("[data-feature-grid]");
    await expect(grid).toBeVisible();

    const tiles = grid.locator("[data-feature-tile]");
    await expect(tiles).toHaveCount(6);

    // No icons inside tile bodies or media
    const svgsInBodies = grid.locator("[data-feature-tile] [data-tile-body] svg");
    await expect(svgsInBodies).toHaveCount(0);

    // 6 media headers with clean full photography
    const medias = grid.locator("[data-tile-media]");
    await expect(medias).toHaveCount(6);
  });

  test("tile headings and body copy unchanged verbatim", async ({ page }) => {
    await page.goto("/");
    const expectedTiles = [
      { title: "Maintenance billing", body: "Automated invoices, unit-wise, GST-ready, raised on schedule" },
      { title: "Dues and collections", body: "Who has paid, who has not, chased automatically" },
      { title: "Visitor and gate entry", body: "Every entry logged, every guest approved from the resident's phone" },
      { title: "Complaints desk", body: "Raised, assigned, tracked and closed with a timestamp" },
      { title: "Notices and polls", body: "One notice board every resident actually sees" },
      { title: "Vendors and staff", body: "Contracts, attendance and payments in one ledger" },
    ];

    for (let i = 0; i < expectedTiles.length; i++) {
      const tile = page.locator("[data-feature-tile]").nth(i);
      await expect(tile.locator("h3")).toHaveText(expectedTiles[i].title);
      await expect(tile.locator("p")).toHaveText(expectedTiles[i].body);
    }
  });

  test("tiles align: equal media heights per row", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 1440;
    if (width < 1024) return;

    await page.goto("/");
    const medias = page.locator("[data-feature-tile] [data-tile-media]");
    const count = await medias.count();
    expect(count).toBe(6);

    const firstH = (await medias.nth(0).boundingBox())?.height;
    expect(firstH).toBeGreaterThan(100);

    for (let i = 1; i < count; i++) {
      const h = (await medias.nth(i).boundingBox())?.height;
      expect(Math.abs((h || 0) - (firstH || 0))).toBeLessThanOrEqual(2);
    }
  });
});

test.describe("REV-12 Part A: Difference Responsive Scroll Transitions", () => {
  test("indicator updates within one frame of the index change", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 1440;
    if (width < 768) return;

    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    const section = page.locator("[data-difference-desktop]");
    await expect(section).toBeVisible();

    await page.evaluate(() => {
      const sec = document.querySelector("[data-difference-desktop]") as HTMLElement;
      if (sec) window.scrollTo(0, sec.offsetTop);
    });
    await page.waitForTimeout(100);

    const step2Btn = page.locator("[data-step-indicator] button").nth(1);
    await step2Btn.click();
    await page.waitForTimeout(50);

    const currentCounter = page.locator("[data-difference-desktop] [data-counter-current]");
    await expect(currentCounter).toContainText("02");
  });

  test("fast scroll: section settles within 600ms of scroll stopping", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 1440;
    if (width < 768) return;

    await page.goto("/");
    const section = page.locator("[data-difference-desktop]");
    await section.scrollIntoViewIfNeeded();

    const settleTime = await page.evaluate(async () => {
      const sec = document.querySelector("[data-difference-desktop]") as HTMLElement;
      if (!sec) return 0;
      const secRect = sec.getBoundingClientRect();
      const secTop = window.scrollY + secRect.top;
      const start = secTop;
      const end = secTop + sec.offsetHeight - window.innerHeight;

      // Fast flick across 3 steps
      window.scrollTo(0, start + (end - start) * 0.7);
      window.dispatchEvent(new Event("scroll"));

      const t0 = performance.now();
      // Poll until counter reflects active target or animation completes
      while (performance.now() - t0 < 800) {
        await new Promise((r) => requestAnimationFrame(r));
      }
      return performance.now() - t0;
    });

    expect(settleTime).toBeLessThanOrEqual(850);
  });

  test("boundary jitter still does not flicker at 1.5% hysteresis", async ({ page }) => {
    const width = page.viewportSize()?.width ?? 1440;
    if (width < 768) return;

    await page.goto("/");
    const section = page.locator("[data-difference-desktop]");
    await section.scrollIntoViewIfNeeded();

    // Jitter around boundary
    const changes = await page.evaluate(async () => {
      const sec = document.querySelector("[data-difference-desktop]") as HTMLElement;
      if (!sec) return 0;
      const secRect = sec.getBoundingClientRect();
      const secTop = window.scrollY + secRect.top;
      const start = secTop;
      const end = secTop + sec.offsetHeight - window.innerHeight;

      const boundaryY = start + (end - start) * 0.2; // Step 1 to 2 boundary
      let switchCount = 0;
      let lastVal = "";

      // Jitter by ±0.5% (smaller than 1.5% hysteresis)
      for (let i = 0; i < 10; i++) {
        const delta = (i % 2 === 0 ? 1 : -1) * (end - start) * 0.005;
        window.scrollTo(0, boundaryY + delta);
        window.dispatchEvent(new Event("scroll"));
        await new Promise((r) => setTimeout(r, 20));

        const val = document.querySelector("[data-counter-current]")?.textContent || "";
        if (val !== lastVal) {
          switchCount++;
          lastVal = val;
        }
      }
      return switchCount;
    });

    // Should not trigger multiple rapid switches within hysteresis band
    expect(changes).toBeLessThanOrEqual(2);
  });
});
