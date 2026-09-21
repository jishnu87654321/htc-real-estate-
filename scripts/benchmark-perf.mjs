import { chromium } from "playwright";

async function measurePerf(throttled = false) {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  if (throttled) {
    const cdp = await context.newCDPSession(page);
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }

  await page.goto("http://localhost:3000");
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1200);

  // Measure Hero transitions
  const heroFrameTimes = await page.evaluate(async () => {
    const times = [];
    let lastTime = performance.now();
    let tracking = true;

    function frame(t) {
      if (!tracking) return;
      times.push(t - lastTime);
      lastTime = t;
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // Trigger 4 hero slide changes
    for (let i = 1; i <= 4; i++) {
      const btn = document.querySelector(`[aria-label="Jump to slide ${(i % 4) + 1}"]`);
      if (btn) btn.click();
      await new Promise((r) => setTimeout(r, 1400));
    }

    tracking = false;
    return times;
  });

  const sorted = heroFrameTimes.filter((t) => t > 0).sort((a, b) => b - a);
  const worst = sorted[0] || 16.6;
  const p95 = sorted[Math.floor(sorted.length * 0.05)] || 16.6;
  const avg = heroFrameTimes.reduce((a, b) => a + b, 0) / (heroFrameTimes.length || 1);
  const fps = Math.round(1000 / (avg || 16.6));

  await browser.close();
  return { throttled, worst: Number(worst.toFixed(2)), p95: Number(p95.toFixed(2)), avg: Number(avg.toFixed(2)), fps };
}

async function run() {
  console.log("Measuring normal performance...");
  const normal = await measurePerf(false);
  console.log("Normal (1x):", normal);

  console.log("Measuring throttled performance (4x CPU)...");
  const throttled = await measurePerf(true);
  console.log("Throttled (4x):", throttled);
}

run();
