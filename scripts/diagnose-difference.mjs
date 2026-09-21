import { chromium } from "playwright";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log("Navigating to http://localhost:3000 ...");
  await page.goto("http://localhost:3000", { waitUntil: "networkidle" });

  const section = page.locator("[data-difference-desktop]");
  const isVisible = await section.isVisible();
  console.log("Section visible:", isVisible);

  const box = await section.boundingBox();
  console.log("Section bounding box:", box);

  // Layer 1 Test
  const layer1 = await page.evaluate(() => {
    const sec = document.querySelector("[data-difference-desktop]");
    if (!sec) return { found: false };
    const r = sec.getBoundingClientRect();
    return {
      found: true,
      height: r.height,
      top: r.top,
      scrollHeight: sec.scrollHeight,
      offsetTop: sec.offsetTop,
    };
  });
  console.log("Layer 1 measurement:", layer1);

  // Scroll down incrementally across the section
  console.log("\n--- Scrolling through section in increments of 100px ---");
  const scrollSteps = [];
  const startY = Math.round(box.y);
  const endY = Math.round(box.y + box.height);
  
  for (let y = startY; y <= endY; y += 100) {
    await page.evaluate((targetY) => window.scrollTo(0, targetY), y);
    await page.waitForTimeout(60);

    const state = await page.evaluate(() => {
      const counterEl = document.querySelector("[data-counter-current]");
      const activeCard = document.querySelector("[data-card-stack] [data-card][style*='opacity: 1']");
      const activeBtn = document.querySelector("[data-step-indicator] span.text-red-600");
      const sec = document.querySelector("[data-difference-desktop]");
      const r = sec?.getBoundingClientRect();
      const photoImg = document.querySelector("[data-difference-desktop] [data-photo-transition-container] img");

      return {
        scrollY: window.scrollY,
        secTop: Math.round(r?.top || 0),
        counter: counterEl?.textContent?.trim(),
        activeCard: activeCard?.getAttribute("data-card"),
        activeBtn: activeBtn?.textContent?.trim(),
        photoSrc: photoImg?.getAttribute("src"),
      };
    });
    scrollSteps.push(state);
  }

  const uniqueCounters = [...new Set(scrollSteps.map(s => s.counter))];
  const uniqueCards = [...new Set(scrollSteps.map(s => s.activeCard))];
  const uniqueBtns = [...new Set(scrollSteps.map(s => s.activeBtn))];
  const uniquePhotos = [...new Set(scrollSteps.map(s => s.photoSrc))];

  console.log("\nUnique counters seen:", uniqueCounters);
  console.log("Unique cards seen:", uniqueCards);
  console.log("Unique indicator buttons seen:", uniqueBtns);
  console.log("Unique photos seen:", uniquePhotos);

  await browser.close();
}

main().catch(console.error);
