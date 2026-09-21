import fs from "fs";
import path from "path";

function findInDir(dir, filter) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(findInDir(full, filter));
    } else if (filter(full)) {
      results.push(full);
    }
  }
  return results;
}

const files = findInDir(".", (f) => /\.(tsx|ts|jsx|js|mjs|json|css|md)$/.test(f) && !f.includes("node_modules") && !f.includes(".next") && !f.includes("test-results"));

console.log("=== INVENTORY REPORT (PART B1) ===\n");

console.log("1. DOLLAR SIGNS AND CURRENCY SCAN:");
let dollarCount = 0;
for (const file of files) {
  const content = fs.readFileSync(file, "utf8");
  // Check for literal $ followed by numbers or isolated $ currency symbols
  const matches = content.match(/\$[0-9]+|\bUSD\b|\bDollar\b|DollarSign|CircleDollar|BadgeDollar/g);
  if (matches) {
    console.log(`- In ${file}: matches: ${matches.join(", ")}`);
    dollarCount += matches.length;
  }
}
if (dollarCount === 0) {
  console.log("  No literal $ currency or USD values found in codebase source files. (All currency values use ₹ / INR).");
}

console.log("\n2. ICON-LED CARD GRIDS SITE-WIDE:");
console.log("- Homepage (/):");
console.log("  • HomeCommunities.tsx: 6 feature tiles ('Run the whole community from one place') — currently using Lucide icons (Receipt, Wallet, ScanFace, MessageSquareWarning, Megaphone, HardHat). [BEING REPLACED IN THIS REVISION WITH PHOTO + PRODUCT GLIMPSE]");
console.log("  • Services.tsx: 6 service cards ('Everything around the home, sorted') — using Lucide icons (Truck, FileCheck2, PaintRoller, Wrench, Building2, Landmark).");
console.log("  • TrustStrip.tsx: 4 metrics/facts strip (numbers + labels, no icons).");
console.log("- /communities page:");
console.log("  • CommunitiesModules.tsx / CommunitiesFeatures.tsx: Feature breakdown grids.");
console.log("- /operations page:");
console.log("  • OperationsWorkflow.tsx / CommsGraph: System role diagram + workflow stages.");
console.log("- /pricing page:");
console.log("  • PricingComparison / PricingCards: Tier comparison cards.");
console.log("- /list-your-property page:");
console.log("  • OwnerBenefits / Steps: Process steps with step numbers.");
