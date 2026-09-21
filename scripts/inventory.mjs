import fs from "fs";
import path from "path";

function scanDir(dir) {
  let files = [];
  if (!fs.existsSync(dir)) return files;
  for (const item of fs.readdirSync(dir)) {
    const p = path.join(dir, item);
    const stat = fs.statSync(p);
    if (stat.isDirectory()) {
      if (item !== "node_modules" && item !== ".next" && item !== ".git") {
        files = files.concat(scanDir(p));
      }
    } else if (/\.(tsx|ts|jsx|js)$/.test(item)) {
      files.push(p);
    }
  }
  return files;
}

// 1. Routes
function getRoutes(dir, base = "") {
  let routes = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      routes = routes.concat(getRoutes(path.join(dir, entry.name), path.join(base, entry.name)));
    } else if (entry.name === "page.tsx") {
      const r = base.replace(/\\/g, "/");
      routes.push(r === "" ? "/" : "/" + r);
    }
  }
  return routes.sort();
}

const routes = getRoutes(path.join(process.cwd(), "app"));
console.log("=== ROUTES (" + routes.length + ") ===");
routes.forEach((r) => console.log(" - " + r));

// 2. Sections per route & component
const allFiles = [...scanDir(path.join(process.cwd(), "app")), ...scanDir(path.join(process.cwd(), "components"))];

const sections = [];
const interactiveElements = [];
const placeholderMap = new Map();

for (const file of allFiles) {
  const content = fs.readFileSync(file, "utf8");
  const rel = path.relative(process.cwd(), file).replace(/\\/g, "/");

  // Sections
  const secMatches = content.matchAll(/<section[^>]*(\bdata-[\w-]+)?/g);
  for (const m of secMatches) {
    sections.push({ file: rel, match: m[0] });
  }

  // Interactive elements
  const interMatches = content.matchAll(/<(button|a |input|select|textarea|form|details|dialog)/g);
  for (const m of interMatches) {
    interactiveElements.push({ file: rel, tag: m[1].trim() });
  }

  // Placeholders
  const phMatches = content.matchAll(/<Placeholder[^>]*\bid=["']([a-z0-9-]+)["'][^>]*>/g);
  for (const m of phMatches) {
    const fullTag = m[0];
    const id = m[1];
    const ratioMatch = fullTag.match(/ratio=["']([^"']+)["']/);
    const labelMatch = fullTag.match(/label=["']([^"']+)["']/);
    const ratio = ratioMatch ? ratioMatch[1] : "auto";
    const label = labelMatch ? labelMatch[1] : "";
    if (!placeholderMap.has(id)) {
      placeholderMap.set(id, { id, file: rel, ratio, label });
    }
  }
}

console.log("\n=== SECTIONS FOUND: " + sections.length + " ===");
console.log("=== INTERACTIVE ELEMENTS FOUND: " + interactiveElements.length + " ===");
console.log("=== DISTINCT PLACEHOLDERS (" + placeholderMap.size + ") ===");
for (const [id, item] of placeholderMap) {
  console.log(` - ${id} | ratio: ${item.ratio} | file: ${item.file} | label: "${item.label}"`);
}
