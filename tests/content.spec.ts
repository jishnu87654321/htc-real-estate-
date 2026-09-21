import { test, expect } from "@playwright/test";

const SPEC_STRINGS: [string, string][] = [
  ["/", "Homes from the people who run the building."],
  ["/", "Most listing sites start with the listing. We start with the community."],
  ["/", "Three steps. No broker in any of them."],
  ["/list-your-property", "Your next tenant already lives in a community we manage."],
  ["/communities", "Run the community from one place"],
  ["/operations", "Everyone who runs the building, on one line"],
  ["/pricing", "Seekers pay nothing. Everyone else pays for work, not access."],
  ["/about", "We started by running buildings, not listing them"],
];

const BANNED_WORDS = [
  /\bseamless\b/i,
  /\bhassle-free\b/i,
  /\bgame-changing\b/i,
  /\bone-stop\b/i,
  /\brevolutionize\b/i,
];

test.describe("SPEC Content Fidelity & Vocabulary Guard", () => {
  for (const [route, expectedString] of SPEC_STRINGS) {
    test(`content check: ${route} contains "${expectedString}"`, async ({ page }) => {
      await page.goto(route);
      const content = await page.textContent("body");
      expect(content).toContain(expectedString);
    });
  }

  const UNIQUE_ROUTES = Array.from(new Set(SPEC_STRINGS.map(([r]) => r)));

  for (const route of UNIQUE_ROUTES) {
    test(`no banned marketing buzzwords on ${route}`, async ({ page }) => {
      await page.goto(route);
      const text = await page.innerText("body");
      for (const banned of BANNED_WORDS) {
        expect(text).not.toMatch(banned);
      }
    });
  }
});
