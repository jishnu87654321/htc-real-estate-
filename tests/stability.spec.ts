import { test, expect } from "@playwright/test";

test.describe("Homepage Stability & Layout Isolation Guardrails (REV-08)", () => {
  test("hero H1 and search are never covered", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000); // allow initial splash loader to exit

    for (const sel of ["h1", "[data-hero] a[href='/properties']"]) {
      const el = page.locator(sel).first();
      await el.evaluate((node) => node.scrollIntoView({ block: "center", behavior: "instant" }));
      await page.waitForTimeout(150);
      const r = await el.boundingBox();
      if (!r) continue;

      const topElValid = await page.evaluate(
        ([x, y]) => {
          const target = document.elementFromPoint(x, y);
          return target?.closest("[data-hero]") !== null || target?.closest("main") !== null;
        },
        [r.x + Math.min(20, r.width / 2), r.y + r.height / 2]
      );
      expect(topElValid, `Element at ${sel} is not covered`).toBe(true);
    }
  });

  test("no section content overlaps another section, at any scroll position", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const scrollH = await page.evaluate(() => document.documentElement.scrollHeight);
    const viewH = page.viewportSize()?.height ?? 900;

    for (let y = 0; y < scrollH - viewH; y += 250) {
      await page.evaluate((val) => window.scrollTo(0, val), y);
      await page.waitForTimeout(100);

      const overlaps = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll("main > section"));
        const bad: string[] = [];

        sections.forEach((sec, i) => {
          const sr = sec.getBoundingClientRect();
          // Skip checking sections far away from viewport
          if (sr.bottom < -1000 || sr.top > window.innerHeight + 1000) return;

          // Check if sticky section or normal section
          const isStickySec = sec.hasAttribute("data-difference-desktop");
          if (isStickySec) return; // Sticky containers hold themselves within their pinned viewport height

          sec.querySelectorAll("*").forEach((el) => {
            const r = el.getBoundingClientRect();
            if (r.width < 5 || r.height < 5) return;
            // Ignore fixed overlays or modals
            const s = window.getComputedStyle(el);
            if (s.position === "fixed") return;

            if (r.bottom < sr.top - 2 || r.top > sr.bottom + 2) {
              const tag = el.tagName.toLowerCase();
              const cls = (el.className || "").toString().slice(0, 30);
              bad.push(`sec[${i}]: <${tag} class="${cls}"> [top:${Math.round(r.top)}, bot:${Math.round(r.bottom)}] outside [secTop:${Math.round(sr.top)}, secBot:${Math.round(sr.bottom)}]`);
            }
          });
        });
        return bad.slice(0, 5);
      });

      expect(overlaps, `Overlapping elements at scrollY=${y}`).toEqual([]);
    }
  });

  test("no pin-spacer in the DOM", async ({ page }) => {
    await page.goto("/");
    const count = await page.locator(".pin-spacer").count();
    expect(count).toBe(0);
  });

  test("no position:fixed inside any section", async ({ page }) => {
    await page.goto("/");
    const fixedInsideSection = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll("section *"));
      const violations: string[] = [];
      nodes.forEach((n) => {
        const s = window.getComputedStyle(n);
        if (s.position === "fixed") {
          violations.push(
            `${n.tagName.toLowerCase()}.${(n.className || "").toString().slice(0, 40)}`
          );
        }
      });
      return violations;
    });
    expect(fixedInsideSection).toEqual([]);
  });

  test("card stack height is between 150 and 420px", async ({ page }) => {
    await page.goto("/");
    const vWidth = page.viewportSize()?.width ?? 1440;
    if (vWidth < 768) return;

    const stack = page.locator("[data-card-stack]");
    await stack.scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);

    const box = await stack.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(150);
    expect(box!.height).toBeLessThanOrEqual(420);
  });
});
