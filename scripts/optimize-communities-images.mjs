import fs from "fs";
import path from "path";
import sharp from "sharp";

const brainDir = "C:/Users/ASUS/.gemini/antigravity-ide/brain/c6fb39a8-1f6d-4769-a523-3612a88d58a7";
const outDir = path.join(process.cwd(), "public", "sequences");

const items = [
  {
    src: path.join(brainDir, "communities_carousel_01_1789984099236.jpg"),
    dest: path.join(outDir, "communities-carousel-01.jpg"),
  },
  {
    src: path.join(brainDir, "communities_carousel_02_1789984116189.jpg"),
    dest: path.join(outDir, "communities-carousel-02.jpg"),
  },
];

for (const item of items) {
  await sharp(item.src)
    .resize(1120, 1120, { fit: "cover" })
    .jpeg({ quality: 65, progressive: true, mozjpeg: true })
    .toFile(item.dest);
  const stat = fs.statSync(item.dest);
  console.log(`${path.basename(item.dest)}: ${(stat.size / 1024).toFixed(1)} KB`);
}
