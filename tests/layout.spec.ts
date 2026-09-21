import { test, expect } from "@playwright/test";

const BREAKPOINTS = [360, 390, 768, 1024, 1440];
const PRIMARY_ROUTES = ["/", "/properties", "/communities", "/pricing", "/about", "/contact"];
const ALL_SEARCH_WIDTHS = [360, 390, 768, 1024, 1280, 1440, 1600, 1920];
const DESKTOP_HEADER_WIDTHS = [1280, 1440, 1600, 1920];

test.describe("Responsive Layout & Overflow Integrity", () => {
  for (const width of BREAKPOINTS) {
    for (const route of PRIMARY_ROUTES) {
      test(`no horizontal overflow on ${route} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(100);

        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });

        expect(hasHorizontalOverflow).toBe(false);
      });
    }

    test(`header wordmark is visible and non-empty at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/");
      const wordmark = page.locator("header a:has-text('HTC')").first();
      await expect(wordmark).toBeVisible();
    });
  }

  // C-01: Search placeholder must never truncate at any breakpoint (moved to /properties in REV-11)
  for (const width of ALL_SEARCH_WIDTHS) {
    test(`properties search placeholder fits without truncation at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/properties");
      const searchInput = page.locator("#properties-search, [data-search-input]");
      await expect(searchInput).toBeVisible();

      const isFit = await searchInput.evaluate((el: HTMLInputElement) => {
        return el.scrollWidth <= el.clientWidth + 2;
      });
      expect(isFit).toBe(true);
    });
  }

  // C-02 & C-03: Sign In button must not be clipped at viewport right edge across all widths and routes
  const ALL_HEADER_DESKTOP_WIDTHS = [1024, 1152, 1280, 1366, 1440, 1536, 1555, 1600, 1920];
  const ALL_ROUTES = ["/", "/properties", "/communities", "/list-your-property", "/pricing", "/about", "/contact"];

  for (const width of ALL_HEADER_DESKTOP_WIDTHS) {
    for (const route of ALL_ROUTES) {
      test(`header Sign In button and items are fully contained on ${route} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await page.waitForLoadState("domcontentloaded");
        await page.waitForTimeout(50);

        const signInBtn = page.locator("header button:has-text('Sign In')");
        if (width >= 1024) {
          await expect(signInBtn).toBeVisible();
          const headerContainer = page.locator("header > div");
          const containerBox = await headerContainer.boundingBox();
          const btnBox = await signInBtn.boundingBox();

          expect(containerBox).not.toBeNull();
          expect(btnBox).not.toBeNull();

          if (containerBox && btnBox) {
            // Assert button right edge is within container boundary
            expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width + 1);
            // Assert button right edge is within viewport width minus minimal padding
            expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(width);
          }
        }

        // Assert no horizontal scrollbar on header
        const hasHeaderOverflow = await page.evaluate(() => {
          const header = document.querySelector("header");
          if (!header) return false;
          return header.scrollWidth > header.clientWidth;
        });
        expect(hasHeaderOverflow).toBe(false);
      });
    }
  }
});
