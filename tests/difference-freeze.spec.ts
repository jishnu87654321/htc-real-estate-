import { test, expect } from "@playwright/test";

test.describe("Revision 15: Difference Section Scroll & Freeze Prevention", () => {
  test("scrolling through the entire section advances the step index monotonically to the end", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const section = page.locator("[data-difference-desktop]");
    await expect(section).toBeVisible();

    const box = await section.boundingBox();
    expect(box).not.toBeNull();
    const seen = new Set<number>();

    // scroll in fine increments across the section's full height
    for (let y = 0; y <= box!.height; y += 40) {
      await page.evaluate(
        ([targetY]) => window.scrollTo(0, targetY),
        [box!.y + y]
      );
      await page.waitForTimeout(40);
      const current = await page
        .locator('[data-step-indicator] [aria-current="true"]')
        .getAttribute("data-step");
      if (current !== null) {
        seen.add(Number(current));
      }
    }

    expect(seen.has(0)).toBe(true);
    expect(seen.has(4)).toBe(true); // reached the final step — the section is NOT frozen
    expect(seen.size).toBeGreaterThanOrEqual(5); // every step was visited at some point
  });

  test("transition phase always returns to idle within 700ms of an index change", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const section = page.locator("[data-difference-desktop]");
    const box = await section.boundingBox();

    // Scroll to section start
    await page.evaluate(([targetY]) => window.scrollTo(0, targetY), [box!.y + 10]);
    await page.waitForTimeout(100);

    // Scroll across boundary into step 2
    const boundaryY = box!.y + box!.height * 0.25;
    await page.evaluate(([targetY]) => window.scrollTo(0, targetY), [boundaryY]);

    // Poll phase every 50ms, must settle to idle within 700ms
    const startTime = Date.now();
    let settled = false;
    while (Date.now() - startTime < 700) {
      const phase = await page
        .locator("[data-difference-desktop]")
        .getAttribute("data-difference-phase");
      if (phase === "idle") {
        settled = true;
        break;
      }
      await page.waitForTimeout(50);
    }

    expect(settled).toBe(true);
  });

  test("the watchdog is never needed in normal operation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.goto("/", { waitUntil: "domcontentloaded" });
    const section = page.locator("[data-difference-desktop]");
    const box = await section.boundingBox();

    for (let y = 0; y <= box!.height; y += 60) {
      await page.evaluate(
        ([targetY]) => window.scrollTo(0, targetY),
        [box!.y + y]
      );
      await page.waitForTimeout(30);
    }

    expect(errors.some((l) => l.includes("transition watchdog fired"))).toBe(false);
  });

  test("step indicator updates instantly, ahead of the photo transition completing", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/", { waitUntil: "domcontentloaded" });

    const section = page.locator("[data-difference-desktop]");
    const box = await section.boundingBox();

    // Step 0 initial position
    await page.evaluate(([targetY]) => window.scrollTo(0, targetY), [box!.y + 10]);
    await page.waitForTimeout(100);

    // Jump to step 2 boundary (progress ~0.45 -> step index 2)
    const scrollableH = box!.height - 900;
    const step2Y = box!.y + scrollableH * 0.45;
    await page.evaluate(([targetY]) => {
      window.scrollTo(0, targetY);
      window.dispatchEvent(new Event("scroll"));
    }, [step2Y]);

    // Step indicator should have updated immediately to step 2 (0-indexed)
    const indicator = page.locator('[data-step-indicator] [aria-current="true"]');
    await expect(indicator).toHaveAttribute("data-step", "2", { timeout: 300 });
  });
});
