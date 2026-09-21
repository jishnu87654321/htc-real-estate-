import fs from "fs";
import path from "path";

const sequencesDir = path.join(process.cwd(), "public", "sequences");

// Coherent mappings
const mappings = {
  // Detail gallery (coherent flat)
  "detail-gallery-01.jpg": "home-featured-01.jpg",
  "detail-gallery-02.jpg": "home-featured-03.jpg",
  "detail-gallery-03.jpg": "home-featured-02.jpg",
  "detail-gallery-04.jpg": "home-featured-05.jpg",
  "detail-gallery-05.jpg": "home-featured-04.jpg",

  // Detail rooms sequence (coherent flat)
  "detail-rooms-seq-01.jpg": "home-featured-01.jpg",
  "detail-rooms-seq-02.jpg": "home-featured-02.jpg",
  "detail-rooms-seq-03.jpg": "home-featured-03.jpg",
  "detail-rooms-seq-04.jpg": "home-featured-05.jpg",
  "detail-rooms-seq-05.jpg": "home-featured-04.jpg",

  // Owners sequence (empty -> furnished -> keys)
  "owners-seq-01.jpg": "home-hero-seq-03.jpg",
  "owners-seq-02.jpg": "home-featured-01.jpg",
  "owners-seq-03.jpg": "home-owners-01.jpg",

  // Communities sequence
  "communities-seq-01.jpg": "home-hero-seq-02.jpg",
  "communities-seq-02.jpg": "home-hero-seq-04.jpg",
  "communities-seq-03.jpg": "home-difference-seq-03.jpg",
  "communities-seq-04.jpg": "home-hero-seq-01.jpg",
  "communities-seq-05.jpg": "home-difference-seq-04.jpg",
};

let count = 0;
for (const [target, source] of Object.entries(mappings)) {
  const targetPath = path.join(sequencesDir, target);
  const sourcePath = path.join(sequencesDir, source);

  if (fs.existsSync(sourcePath)) {
    fs.copyFileSync(sourcePath, targetPath);
    count++;
  } else {
    console.warn(`Source file not found: ${source}`);
  }
}

console.log(`[populate-sequences] Successfully populated ${count} image slots.`);
