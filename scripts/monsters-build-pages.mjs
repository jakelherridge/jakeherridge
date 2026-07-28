// Monster Book pipeline: process the print scans into web-ready pages.
//  - ~/Documents/Scans-Monsters-Work/print/monster_0NN.png (3508x4961)
//    -> public/monsters/pages/NN.png, grayscale, 1600px tall
//  - poster (monster on paper tint) -> src/assets/monsters-poster.png
import { readdir, mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "/Users/jake/Documents/Scans-Monsters-Work/print";
const OUT = new URL("../public/monsters/pages", import.meta.url).pathname;
await mkdir(OUT, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /^monster_\d+\.png$/.test(f)).sort();
let n = 0;
for (const f of files) {
  n++;
  const num = String(n).padStart(2, "0");
  await sharp(path.join(SRC, f))
    .resize({ height: 1600 })
    .grayscale()
    .png({ compressionLevel: 9, palette: true, colors: 16 })
    .toFile(path.join(OUT, `${num}.png`));
}
console.log(`Pages: ${n} -> public/monsters/pages`);

// Poster + header are hand-picked colored pages (src/assets/monsters-header.png,
// src/assets/monsters-poster.png), not generated here. Jake colored monster 04
// in the exhibit itself and that download became the exhibit's face.
