/**
 * scripts/scroll-sweep.mjs — Comprehensive Scroll-Position Sweep (§7.2)
 */
import { chromium } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const sweepDir = path.join(process.cwd(), "docs", "review", "sweep");
fs.mkdirSync(sweepDir, { recursive: true });

async function runSweep() {
  console.log("[scroll-sweep] Starting scroll position screenshot sweep...");
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 },
  ];

  for (const vp of viewports) {
    console.log(`[scroll-sweep] Capturing viewport: ${vp.name} (${vp.width}x${vp.height})...`);
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

    const totalHeight = await page.evaluate(() => document.documentElement.scrollHeight);
    let index = 0;

    for (let y = 0; y <= totalHeight - vp.height; y += 300) {
      await page.evaluate((val) => window.scrollTo(0, val), y);
      await page.waitForTimeout(300);

      const filename = path.join(
        sweepDir,
        `${vp.name}_step_${String(index).padStart(3, "0")}_y${y}.png`
      );
      await page.screenshot({ path: filename });
      index++;
    }
    await page.close();
  }

  await browser.close();
  console.log(`[scroll-sweep] Sweep complete. Captured screenshots saved to ${sweepDir}`);
}

runSweep().catch((err) => {
  console.error("[scroll-sweep] Error:", err);
  process.exit(1);
});
