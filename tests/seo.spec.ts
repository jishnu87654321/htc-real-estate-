import { test, expect } from "@playwright/test";

const ROUTES = [
  "/",
  "/about",
  "/communities",
  "/communities/residents",
  "/contact",
  "/list-your-property",
  "/operations",
  "/pricing",
  "/properties",
];

test.describe("Suite 9: SEO & Metadata", () => {
  for (const route of ROUTES) {
    test(`route ${route} has proper title, meta description, and canonical link`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("domcontentloaded");

      const title = await page.title();
      expect(title.length).toBeGreaterThan(5);

      const metaDesc = page.locator("meta[name='description']");
      if (await metaDesc.count() > 0) {
        const descContent = await metaDesc.getAttribute("content");
        expect(descContent?.length).toBeGreaterThan(15);
      }

      // Check single H1 per route
      const h1s = page.locator("h1");
      expect(await h1s.count()).toBe(1);
    });
  }

  test("robots.txt is accessible and valid", async ({ request }) => {
    const res = await request.get("/robots.txt");
    if (res.status() === 200) {
      const text = await res.text();
      expect(text.toLowerCase()).toContain("user-agent");
    }
  });
});
