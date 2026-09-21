import { test, expect } from "@playwright/test";

test.describe("Revision 11 — Hero Simplification and Legibility Over Photography", () => {
  test("hero has no badge and no search module", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("[data-hero]");
    await expect(hero.locator("input")).toHaveCount(0);
    await expect(hero.getByText(/Verified by the teams/i)).toHaveCount(0);
    await expect(hero.getByText(/Popular:/i)).toHaveCount(0);
  });

  test("hero CTAs present and navigate", async ({ page }) => {
    await page.goto("/");
    const hero = page.locator("[data-hero]");
    await hero.getByRole("link", { name: "Find a home" }).click();
    await expect(page).toHaveURL(/\/properties/);
    await page.goto("/");
    await page.locator("[data-hero]").getByRole("link", { name: "List your property" }).click();
    await expect(page).toHaveURL(/\/list-your-property/);
  });

  test("rotating line words have no blur once settled", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(1500);
    const filters = await page.$$eval("[data-rotating-line] span", (spans) =>
      spans.map((e) => getComputedStyle(e).filter)
    );
    for (const f of filters) {
      expect(f === "none" || f === "").toBe(true);
    }
  });

  test("CTAs never move between slides", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const getCtaOffset = async () => {
      return page.evaluate(() => {
        const btn = document.querySelector("[data-hero] a[href='/properties']");
        const hero = document.querySelector("[data-hero]");
        if (!btn || !hero) return 0;
        return btn.getBoundingClientRect().top - hero.getBoundingClientRect().top;
      });
    };

    const y0 = await getCtaOffset();

    for (let i = 1; i <= 4; i++) {
      await page.locator(`[aria-label='Jump to slide ${i}']`).dispatchEvent("click");
      await page.waitForTimeout(500);
      const y = await getCtaOffset();
      expect(Math.abs(y0 - y)).toBeLessThanOrEqual(1.5);
    }
  });

  test("header is crisp, legible, and dark-toned over hero and after scrolling", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Initially at top: header is backdrop blurred paper with crisp dark wordmark
    const headerInitial = await page.evaluate(() => {
      const header = document.querySelector("header");
      const wordmark = header?.querySelector("a[href='/']");
      return {
        wordmarkColor: wordmark ? window.getComputedStyle(wordmark).color : "",
      };
    });

    expect(headerInitial.wordmarkColor).not.toBe("rgb(255, 255, 255)");

    // Scroll past hero
    await page.evaluate(() => {
      window.scrollTo(0, 700);
      window.dispatchEvent(new Event("scroll"));
    });
    await page.waitForTimeout(400);

    const headerScrolled = await page.evaluate(() => {
      const header = document.querySelector("header");
      const wordmark = header?.querySelector("a[href='/']");
      return {
        wordmarkColor: wordmark ? window.getComputedStyle(wordmark).color : "",
      };
    });

    // Scrolled: stays crisp dark text
    expect(headerScrolled.wordmarkColor).not.toBe("rgb(255, 255, 255)");
  });

  test("search still works on /properties and placeholder is not truncated", async ({ page }) => {
    await page.goto("/properties");
    const searchInput = page.locator("#properties-search, [data-search-input]");
    await expect(searchInput).toBeVisible();

    const isFit = await searchInput.evaluate((el: HTMLInputElement) => {
      return el.scrollWidth <= el.clientWidth + 2;
    });
    expect(isFit).toBe(true);

    await searchInput.fill("Sarvani");
    await page.waitForTimeout(100);
    const listingTitles = await page.locator("[data-listing-card] h2, [data-listing-card] p, article h2").allTextContents();
    expect(listingTitles.some((t) => t.includes("Sarvani"))).toBe(true);
  });

  test("header Buy and Rent links reach search", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Buy" }).click();
    await expect(page).toHaveURL(/\/properties/);

    await page.goto("/");
    await page.locator("header").getByRole("link", { name: "Rent" }).click();
    await expect(page).toHaveURL(/\/properties/);
  });

  test("mobile: vertical scrim, stacked CTAs", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const ctaLayout = await page.evaluate(() => {
      const btn1 = document.querySelector("[data-hero] a[href='/properties']");
      const btn2 = document.querySelector("[data-hero] a[href='/list-your-property']");
      if (!btn1 || !btn2) return null;
      const b1 = btn1.getBoundingClientRect();
      const b2 = btn2.getBoundingClientRect();
      return {
        stacked: b2.top > b1.top,
        fullWidth: b1.width > 300,
      };
    });

    expect(ctaLayout?.stacked).toBe(true);
    expect(ctaLayout?.fullWidth).toBe(true);
  });
});
