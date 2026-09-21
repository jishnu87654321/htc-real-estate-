import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function record() {
  const videoDir = path.join(process.cwd(), "docs", "review", "transitions");
  fs.mkdirSync(videoDir, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videoDir, size: { width: 1440, height: 900 } },
  });

  const page = await context.newPage();
  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1200);

  console.log("Recording Hero transitions...");
  for (let i = 1; i <= 3; i++) {
    const nextIdx = i + 1;
    await page.locator(`[aria-label="Jump to slide ${nextIdx}"]`).click();
    await page.waitForTimeout(2000);
  }

  console.log("Scrolling to Difference section...");
  const diffSection = page.locator("[data-difference-desktop]");
  await diffSection.scrollIntoViewIfNeeded();
  await page.waitForTimeout(1000);

  const sec = await page.locator("[data-difference-desktop]").boundingBox();
  const startY = await page.evaluate(() => window.scrollY);
  const totalH = sec ? sec.height : 2400;

  console.log("Stepping through difference sequence 01 -> 05...");
  for (let step = 1; step <= 5; step++) {
    const targetY = startY + (totalH * (step - 0.5) / 5);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), targetY);
    await page.waitForTimeout(1400);
  }

  console.log("Reversing back through difference sequence 05 -> 01...");
  for (let step = 4; step >= 1; step--) {
    const targetY = startY + (totalH * (step - 0.5) / 5);
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: "smooth" }), targetY);
    await page.waitForTimeout(1400);
  }

  await page.waitForTimeout(1000);
  await context.close();
  await browser.close();

  console.log("Recorded transitions video successfully in docs/review/transitions/");
}

record();
