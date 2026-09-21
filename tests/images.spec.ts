import { test, expect } from "@playwright/test";

test.describe("Suite 10: Image Integrity", () => {
  test("all rendered images load with naturalWidth > 0 and no broken sources", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const images = await page.$$eval("img", (imgs) =>
      imgs.map((img) => ({
        src: img.src,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        complete: img.complete,
      }))
    );

    for (const img of images) {
      if (img.src && !img.src.startsWith("data:") && img.complete) {
        expect(img.naturalWidth, `Image broken: ${img.src}`).toBeGreaterThan(0);
      }
    }
  });

  test("images have sizes attributes specified", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const missingSizes = await page.$$eval("img", (imgs) =>
      imgs
        .filter((img) => !img.hasAttribute("sizes") && !img.src.startsWith("data:") && img.width > 200)
        .map((img) => img.src)
    );

    expect(missingSizes).toHaveLength(0);
  });
});
