import { chromium } from "playwright";

async function measure() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("http://localhost:3030/");
  await page.waitForLoadState("networkidle");

  const diffEl = page.locator("[data-difference-desktop]");
  await diffEl.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  console.log("=== PART A: MEASURING EXISTING DIFFERENCE SECTION TIMINGS (REV-11) ===");

  // Slow scroll test: move 200px over 1 second
  const slowResult = await page.evaluate(async () => {
    const diff = document.querySelector("[data-difference-desktop]");
    if (!diff) return null;

    const startY = diff.offsetTop;
    window.scrollTo({ top: startY, behavior: "instant" });
    await new Promise(r => setTimeout(r, 200));

    const logs = [];
    const t0 = performance.now();

    // Scroll slowly across step 1 -> step 2
    for (let i = 0; i < 20; i++) {
      window.scrollBy(0, 30);
      await new Promise(r => setTimeout(r, 40));
    }

    const tScrollStop = performance.now();

    // Observe how long until phase settles
    let settledTime = null;
    while (performance.now() - tScrollStop < 3000) {
      const isEntering = document.querySelector("[data-photo-layer='current']")?.getAttribute("data-entering") === "true";
      if (!isEntering && settledTime === null && performance.now() - tScrollStop > 100) {
        settledTime = performance.now();
        break;
      }
      await new Promise(r => setTimeout(r, 30));
    }

    return {
      scrollDuration: tScrollStop - t0,
      settleAfterScroll: (settledTime || performance.now()) - tScrollStop,
    };
  });

  console.log("Slow scroll measurement (approx <400 px/s):", slowResult);

  // Fast scroll test: trackpad flick / rapid scroll across 3 steps
  const fastResult = await page.evaluate(async () => {
    const diff = document.querySelector("[data-difference-desktop]");
    if (!diff) return null;

    const startY = diff.offsetTop;
    window.scrollTo({ top: startY, behavior: "instant" });
    await new Promise(r => setTimeout(r, 200));

    const t0 = performance.now();
    // Rapid flick across 1500px in 150ms
    for (let i = 0; i < 5; i++) {
      window.scrollBy(0, 300);
      await new Promise(r => setTimeout(r, 25));
    }
    const tScrollStop = performance.now();

    // In REV-11, the queue causes transitions to play back-to-back:
    // Step 0 -> 1 -> 2 -> 3 queued up sequentially!
    let settledTime = null;
    while (performance.now() - tScrollStop < 5000) {
      const isEntering = document.querySelector("[data-photo-layer='current']")?.getAttribute("data-entering") === "true";
      const counter = document.querySelector("[data-counter-current]")?.textContent;
      if (!isEntering && counter === "04" && settledTime === null) {
        settledTime = performance.now();
        break;
      }
      await new Promise(r => setTimeout(r, 30));
    }

    return {
      scrollDuration: tScrollStop - t0,
      settleAfterScroll: (settledTime || performance.now()) - tScrollStop,
    };
  });

  console.log("Fast scroll measurement (approx >2500 px/s flick):", fastResult);

  await browser.close();
}

measure().catch(console.error);
