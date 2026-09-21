/**
 * scripts/check-deps.mjs — Dependency & Fixed-Position Guardrails (§6)
 */
import fs from "node:fs";
import path from "node:path";

console.log("[guardrails] Running dependency and fixed-position integrity checks...");

// 1. Dependency Guard
const pkgJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const allDeps = {
  ...pkgJson.dependencies,
  ...pkgJson.devDependencies,
};

const forbiddenDeps = ["gsap", "@gsap/react", "lenis", "@studio-freight/lenis"];
const foundForbiddenDeps = forbiddenDeps.filter((dep) => dep in allDeps);

if (foundForbiddenDeps.length > 0) {
  console.error(
    "[guardrails] FORBIDDEN DEPENDENCY DETECTED in package.json: " +
      foundForbiddenDeps.join(", ")
  );
  process.exit(1);
}
console.log("[guardrails] Dependency check passed (0 forbidden libraries).");

// 2. Fixed-Position Guard
const searchDirs = ["components/sections", "app"];
const fixedRegex = /\bposition:\s*fixed\b|\bfixed\b/;

let violations = [];

function scanDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next") {
        scanDir(full);
      }
    } else if (
      entry.isFile() &&
      (full.endsWith(".tsx") || full.endsWith(".jsx") || full.endsWith(".css"))
    ) {
      const normalized = full.replace(/\\/g, "/");
      const isSection = normalized.includes("components/sections/");
      const isPage = normalized.includes("app/") && normalized.endsWith("page.tsx");

      if (isSection || isPage) {
        const content = fs.readFileSync(full, "utf8");
        const lines = content.split("\n");
        lines.forEach((line, idx) => {
          const trimmed = line.trim();
          if (
            trimmed.startsWith("//") ||
            trimmed.startsWith("/*") ||
            trimmed.startsWith("*")
          ) {
            return;
          }
          if (fixedRegex.test(line)) {
            if (
              line.includes('className="') &&
              /\bfixed\b/.test(line) &&
              !line.includes("lg:sticky") &&
              !normalized.includes("StickyContactBar.tsx")
            ) {
              violations.push({
                file: normalized,
                line: idx + 1,
                content: trimmed,
              });
            } else if (/position:\s*fixed/.test(line)) {
              violations.push({
                file: normalized,
                line: idx + 1,
                content: trimmed,
              });
            }
          }
        });
      }
    }
  }
}

searchDirs.forEach((d) => scanDir(d));

if (violations.length > 0) {
  console.error("[guardrails] FORBIDDEN position:fixed DETECTED in page content/sections:");
  violations.forEach((v) => {
    console.error("   -> " + v.file + ":" + v.line + ": " + v.content);
  });
  process.exit(1);
}

console.log("[guardrails] Fixed-position check passed (0 violations in sections/pages).");
