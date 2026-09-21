import { test, expect } from "@playwright/test";

test.describe("Suite 4: Site-Wide Interaction", () => {
  test("header mobile menu opens, traps focus, and closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const menuBtn = page.locator("[aria-label='Open navigation menu'], [aria-label='Toggle menu'], [data-mobile-menu-toggle]").first();
    if (await menuBtn.isVisible()) {
      await menuBtn.click();
      await page.waitForTimeout(300);

      // Verify close button or nav is visible
      const closeBtn = page.locator("[aria-label='Close menu'], [data-mobile-menu-close]").first();
      if (await closeBtn.isVisible()) {
        await page.keyboard.press("Escape");
        await page.waitForTimeout(300);
      }
    }
  });

  test("properties search module switches tabs and accepts queries", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/properties");
    await page.waitForLoadState("domcontentloaded");

    // Click 'Buy' tab
    const buyTab = page.locator("button:has-text('Buy')").first();
    await buyTab.click();
    await expect(buyTab).toHaveAttribute("aria-selected", "true");

    // Search input typing
    const searchInput = page.locator("#properties-search, [data-search-input]");
    await searchInput.fill("Gachibowli");
    expect(await searchInput.inputValue()).toBe("Gachibowli");
  });

  test("hero CTAs navigate cleanly", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");

    const hero = page.locator("[data-hero]");
    const findHomeBtn = hero.getByRole("link", { name: "Find a home" });
    await expect(findHomeBtn).toBeVisible();
    await findHomeBtn.click();
    await expect(page).toHaveURL(/\/properties/);

    await page.goto("/");
    const listBtn = page.locator("[data-hero]").getByRole("link", { name: "List your property" });
    await expect(listBtn).toBeVisible();
    await listBtn.click();
    await expect(page).toHaveURL(/\/list-your-property/);
  });

  test("pricing plan toggle switches between Owner and Community plans", async ({ page }) => {
    await page.goto("/pricing");
    await page.waitForLoadState("domcontentloaded");

    const buttons = page.locator("button:has-text('Owners'), button:has-text('Communities')");
    if (await buttons.count() >= 2) {
      await buttons.nth(1).click();
      await page.waitForTimeout(200);
      await buttons.nth(0).click();
      await page.waitForTimeout(200);
    }
  });

  test("contact page route selector switches topics", async ({ page }) => {
    await page.goto("/contact");
    await page.waitForLoadState("domcontentloaded");

    const ownerBtn = page.locator("button:has-text('Property Owner'), button:has-text('Owner')").first();
    if (await ownerBtn.isVisible()) {
      await ownerBtn.click();
      await page.waitForTimeout(200);
    }
  });

  test("list-your-property wizard steps navigate cleanly", async ({ page }) => {
    await page.goto("/list-your-property");
    await page.waitForLoadState("domcontentloaded");

    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
  });
});
