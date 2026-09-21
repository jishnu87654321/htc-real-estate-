import fs from "fs";
import path from "path";

const cssPath = path.join(process.cwd(), "app", "globals.css");
const css = fs.readFileSync(cssPath, "utf8");

const definedTokens = new Set();
const definedMatches = css.matchAll(/^\s*(--[a-zA-Z0-9_-]+)/gm);
for (const m of definedMatches) {
  definedTokens.add(m[1]);
}

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
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(item) && !item.endsWith(".bak")) {
      files.push(p);
    }
  }
  return files;
}

const files = [
  ...scanDir(path.join(process.cwd(), "app")),
  ...scanDir(path.join(process.cwd(), "components")),
  ...scanDir(path.join(process.cwd(), "lib")),
];

const undefinedReferences = [];
const bannedColorReferences = [];

for (const file of files) {
  if (path.resolve(file) === path.resolve(cssPath)) continue;
  const content = fs.readFileSync(file, "utf8");
  const relPath = path.relative(process.cwd(), file);

  // Check var(--token)
  const varMatches = content.matchAll(/var\((--[a-zA-Z0-9_-]+)\)/g);
  for (const m of varMatches) {
    const token = m[1];
    if (!definedTokens.has(token)) {
      const line = content.substring(0, m.index).split("\n").length;
      undefinedReferences.push({ file: relPath, token, line });
    }
  }

  // Check raw black outside globals.css
  const blackMatches = content.matchAll(/(#000000|#000\b|fill=["']black["']|fill:\s*black)/g);
  for (const m of blackMatches) {
    const line = content.substring(0, m.index).split("\n").length;
    bannedColorReferences.push({ file: relPath, match: m[0], line });
  }
}

let hasError = false;

if (undefinedReferences.length > 0) {
  console.error("\n❌ Found undefined CSS token references:");
  for (const item of undefinedReferences) {
    console.error(`  ${item.file}:${item.line} -> ${item.token}`);
  }
  hasError = true;
}

if (bannedColorReferences.length > 0) {
  console.error("\n❌ Found banned raw black color references:");
  for (const item of bannedColorReferences) {
    console.error(`  ${item.file}:${item.line} -> ${item.match}`);
  }
  hasError = true;
}

if (hasError) {
  process.exit(1);
} else {
  console.log("✅ All CSS tokens are valid and defined. No raw black colors found.");
  process.exit(0);
}
