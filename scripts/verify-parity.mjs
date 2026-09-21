import fs from "fs";
import path from "path";

const manifestPath = path.join(process.cwd(), "docs", "IMAGE-MANIFEST.md");
const manifestContent = fs.readFileSync(manifestPath, "utf8");

const manifestIds = new Set();
for (const match of manifestContent.matchAll(/\| `([a-z0-9-]+)`/g)) {
  manifestIds.add(match[1]);
}

console.log(`[verify-parity] Found ${manifestIds.size} unique IDs in docs/IMAGE-MANIFEST.md:`);
for (const id of Array.from(manifestIds).sort()) {
  console.log(`  - ${id}`);
}
