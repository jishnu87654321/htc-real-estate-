/**
 * scripts/build-hero-bg.mjs
 * Generates pre-blurred hero background files at build time.
 * Output: public/sequences/bg/home-hero-seq-NN.webp and lib/hero-bg-placeholder.json
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const HERO_IDS = ["home-hero-seq-01","home-hero-seq-02","home-hero-seq-03","home-hero-seq-04"];
const srcDir = path.join(process.cwd(), "public", "sequences");
const outDir = path.join(process.cwd(), "public", "sequences", "bg");
const placeholderFile = path.join(process.cwd(), "lib", "hero-bg-placeholder.json");

fs.mkdirSync(outDir, { recursive: true });
const placeholders = {};
const sizes = {};

for (const id of HERO_IDS) {
  const src = path.join(srcDir, `${id}.jpg`);
  if (!fs.existsSync(src)) { console.warn(`[build-hero-bg] WARNING: ${src} not found`); continue; }
  const outWebP = path.join(outDir, `${id}.webp`);
  await sharp(src).resize({ width: 1600, withoutEnlargement: true }).blur(6).modulate({ saturation: 0.9, brightness: 1.04 }).webp({ quality: 62 }).toFile(outWebP);
  const stat = fs.statSync(outWebP);
  sizes[id] = `${Math.round(stat.size / 1024)} KB`;
  if (id === "home-hero-seq-01") {
    const buf = await sharp(src).resize(24).blur(4).webp({ quality: 40 }).toBuffer();
    placeholders["home-hero-seq-01"] = `data:image/webp;base64,${buf.toString("base64")}`;
  }
  console.log(`[build-hero-bg] ${id}.webp -> ${sizes[id]}`);
}
fs.writeFileSync(placeholderFile, JSON.stringify(placeholders, null, 2), "utf8");
console.log(`[build-hero-bg] Done. Sizes: ${JSON.stringify(sizes)}`);
