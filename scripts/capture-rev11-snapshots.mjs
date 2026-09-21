import { chromium } from "playwright";
import fs from "fs";
import path from "path";

async function capture() {
  const dir = path.resolve("docs/review/rev11");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const configs = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const cfg of configs) {
    await page.setViewportSize({ width: cfg.width, height: cfg.height });

    for (let slide = 1; slide <= 4; slide++) {
      await page.goto("http://localhost:3030/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(400);

      // Jump to slide
      await page.locator(`[aria-label='Jump to slide ${slide}']`).dispatchEvent("click");
      // Pause
      const pauseBtn = page.locator("[aria-label='Pause slideshow']");
      if (await pauseBtn.isVisible()) {
        await pauseBtn.click();
      }
      await page.waitForTimeout(600);

      const hero = page.locator("[data-hero]");
      const filePath = path.join(dir, `hero-slide-0${slide}-${cfg.name}-${cfg.width}px.png`);
      await hero.screenshot({ path: filePath });
      console.log(`Saved screenshot: ${filePath}`);
    }
  }

  await browser.close();
}

capture().catch(console.error);
