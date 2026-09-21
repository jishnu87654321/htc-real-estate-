import fs from "fs";
import path from "path";
import sharp from "sharp";

const sequencesDir = path.join(process.cwd(), "public", "sequences");
const outputFile = path.join(process.cwd(), "lib", "available-images.json");

const FOCAL_MAP = {
  "home-hero-seq-01": { x: 0.55, y: 0.45 },
  "home-hero-seq-02": { x: 0.52, y: 0.48 },
  "home-hero-seq-03": { x: 0.50, y: 0.45 },
  "home-hero-seq-04": { x: 0.50, y: 0.46 },
  "home-difference-seq-01": { x: 0.50, y: 0.45 },
  "home-difference-seq-02": { x: 0.52, y: 0.42 },
  "home-difference-seq-03": { x: 0.50, y: 0.45 },
  "home-difference-seq-04": { x: 0.50, y: 0.45 },
  "home-difference-seq-05": { x: 0.50, y: 0.48 },
};

const availableImages = [];

if (fs.existsSync(sequencesDir)) {
  const files = fs.readdirSync(sequencesDir);
  for (const file of files) {
    if (/\.(jpg|jpeg|png|webp|avif)$/i.test(file)) {
      const id = path.parse(file).name;
      const filePath = path.join(sequencesDir, file);
      let avgColor = "rgb(120, 115, 110)";
      try {
        const stats = await sharp(filePath).stats();
        const [r, g, b] = stats.channels.slice(0, 3).map((c) => Math.round(c.mean));
        avgColor = `rgb(${r}, ${g}, ${b})`;
      } catch (err) {
        console.error(`Failed to calculate stats for ${file}:`, err);
      }

      const focal = FOCAL_MAP[id] || { x: 0.5, y: 0.5 };

      availableImages.push({
        id,
        filename: file,
        path: `/sequences/${file}`,
        avgColor,
        focal,
        generated: true, // All generated stand-ins flagged for safety
      });
    }
  }
}

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, JSON.stringify(availableImages, null, 2), "utf8");
console.log(`[scan-images] Found ${availableImages.length} real sequence image(s). Generated metadata.`);

