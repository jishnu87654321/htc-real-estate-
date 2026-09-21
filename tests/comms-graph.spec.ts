import { test, expect } from "@playwright/test";

test.describe("Behind the Gate — CommsGraph Diagram", () => {
  test("no node or label renders pure black or near-white", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const graph = page.locator("[data-comms-graph]");
    await graph.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // SVG elements should not have pure black fill
    const svgFills = await page.$$eval("[data-comms-graph] svg *:not(g)", (els) =>
      els.map((e) => window.getComputedStyle(e).fill).filter((f) => f && f !== "none")
    );
    expect(svgFills).not.toContain("rgb(0, 0, 0)");

    // Text labels should not have pure black or near-white color
    const textColours = await page.$$eval(
      "[data-comms-graph] [data-role-node] span, [data-comms-graph] [data-hub-node] span",
      (els) => els.map((e) => window.getComputedStyle(e).color)
    );
    expect(textColours).not.toContain("rgb(0, 0, 0)");
    expect(textColours).not.toContain("rgb(240, 237, 232)");
  });

  test("hub text is exactly HTC and no activity log exists in the DOM", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const graph = page.locator("[data-comms-graph]");
    await graph.scrollIntoViewIfNeeded();

    const hubText = page.locator("[data-comms-graph] [data-hub-node] span").first();
    await expect(hubText).toHaveText("HTC");

    // Activity log must be removed (§B1)
    const activityLog = page.locator("[data-comms-graph] [data-activity-log]");
    await expect(activityLog).toHaveCount(0);

    // No "Real-time" or "sync" claims (§B7)
    const realTimeTexts = page.locator("[data-comms-graph] :has-text('Real-time sync')");
    await expect(realTimeTexts).toHaveCount(0);

    // "Illustrative" label must be visible (§B7)
    const illustrative = page.locator("[data-comms-graph] :has-text('Illustrative')").first();
    await expect(illustrative).toBeVisible();
  });

  test("five role nodes plus a hub are present on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const graph = page.locator("[data-comms-graph]");
    await graph.scrollIntoViewIfNeeded();

    const roleNodes = page.locator(".sm\\:block [data-role-node]");
    const hubNode = page.locator(".sm\\:block [data-hub-node]");

    await expect(roleNodes).toHaveCount(5);
    await expect(hubNode).toHaveCount(1);
  });

  test("script pauses on node hover and resumes on leave", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const graph = page.locator("[data-comms-graph]");
    await graph.scrollIntoViewIfNeeded();

    const node = page.locator(".sm\\:block [data-role-node='guards']");
    await node.hover();
    await page.waitForTimeout(500);

    // Tooltip should be visible
    const tooltip = page.locator("#tooltip-guards");
    await expect(tooltip).toBeVisible();

    // Leave hover
    await page.mouse.move(0, 0);
    await page.waitForTimeout(300);
    await expect(tooltip).not.toBeVisible();
  });

  test("pause button stops the script", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const graph = page.locator("[data-comms-graph]");
    await graph.scrollIntoViewIfNeeded();

    const pauseBtn = page.locator("[data-comms-graph] button[aria-label='Pause animation']");
    await expect(pauseBtn).toBeVisible();

    await pauseBtn.click();
    const playBtn = page.locator("[data-comms-graph] button[aria-label='Play animation']");
    await expect(playBtn).toBeVisible();

    // Click again to resume
    await playBtn.click();
    await expect(pauseBtn).toBeVisible();
  });

  test("tokens are contained within the diagram bounding box", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const graph = page.locator("[data-comms-graph]");
    await graph.evaluate((el) => el.scrollIntoView({ block: "center" }));
    await page.waitForTimeout(1000);

    const graphBox = await graph.boundingBox();
    expect(graphBox).not.toBeNull();

    // Sample over 4 seconds for any token pill
    for (let i = 0; i < 8; i++) {
      await page.waitForTimeout(500);
      const tokenPill = page.locator("[data-comms-graph] .pointer-events-none");
      const count = await tokenPill.count();
      if (count > 0) {
        const tokenBox = await tokenPill.first().boundingBox();
        if (tokenBox && graphBox) {
          expect(tokenBox.x).toBeGreaterThanOrEqual(graphBox.x - 2);
          expect(tokenBox.x + tokenBox.width).toBeLessThanOrEqual(graphBox.x + graphBox.width + 2);
        }
      }
    }
  });

  test("mobile renders vertical flow at 390px", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    const graph = page.locator("[data-comms-graph]");
    await graph.scrollIntoViewIfNeeded();

    const mobileRoles = page.locator(".sm\\:hidden [data-role-node]");
    await expect(mobileRoles).toHaveCount(5);

    const mobileHub = page.locator(".sm\\:hidden [data-hub-node]");
    await expect(mobileHub).toBeVisible();
  });
});

test.describe("Behind the Gate — CommsGraph Reduced Motion", () => {
  test.use({ reducedMotion: "reduce" });

  test("reduced motion shows static diagram with no animated tokens", async ({ page }) => {
    await page.goto("/");
    const graph = page.locator("[data-comms-graph]");
    await graph.scrollIntoViewIfNeeded();

    // No animated in-flight token pill
    const token = page.locator("[data-token-pill]");
    await expect(token).toHaveCount(0);
  });
});
