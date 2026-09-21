import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const imagesJsonPath = path.join(root, "lib", "available-images.json");
const allowStandin = process.env.ALLOW_STANDIN_IMAGES === "true" || process.env.NODE_ENV !== "production";

console.log("[standin-gate] Checking stand-in image policy...");

if (!fs.existsSync(imagesJsonPath)) {
  console.log("[standin-gate] No available-images.json found. Skipping.");
  process.exit(0);
}

try {
  const imagesData = JSON.parse(fs.readFileSync(imagesJsonPath, "utf-8"));
  const standins = [];

  if (Array.isArray(imagesData)) {
    for (const item of imagesData) {
      if (item && item.generated === true) {
        standins.push(item.id);
      }
    }
  } else {
    for (const [id, meta] of Object.entries(imagesData)) {
      if (meta && typeof meta === "object" && meta.generated === true) {
        standins.push(id);
      }
    }
  }

  if (standins.length > 0) {
    if (process.env.NODE_ENV === "production" && !allowStandin) {
      console.error("\n❌ [standin-gate] PRODUCTION BUILD BLOCKED:");
      console.error(`Found ${standins.length} unverified stand-in image(s) in available-images.json:`);
      standins.forEach((id) => console.error(`  - ${id}`));
      console.error("\nPublic production builds require verified photography.");
      console.error("To build for staging/review with stand-ins, set ALLOW_STANDIN_IMAGES=true.\n");
      process.exit(1);
    } else {
      console.log(`ℹ️ [standin-gate] ${standins.length} stand-in image(s) detected. ALLOW_STANDIN_IMAGES is active.`);
    }
  } else {
    console.log("✅ [standin-gate] All images verified. Zero stand-ins detected.");
  }
} catch (err) {
  console.error("[standin-gate] Error reading available-images.json:", err);
  process.exit(1);
}
