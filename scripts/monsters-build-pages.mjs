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

// Poster: first monster's upper body on warm paper, 900x675.
const paper = { r: 244, g: 240, b: 230 };
const page = await sharp(path.join(SRC, "monster_001.png"))
  .resize({ width: 900 })
  .grayscale()
  .toBuffer();
const meta = await sharp(page).metadata();
const top = Math.round((meta.height - 675) * 0.28);
const crop = await sharp(page)
  .extract({ left: 0, top, width: 900, height: 675 })
  .toBuffer();
await sharp({
  create: { width: 900, height: 675, channels: 3, background: paper },
})
  .composite([{ input: crop, blend: "multiply" }])
  .png()
  .toFile(new URL("../src/assets/monsters-poster.png", import.meta.url).pathname);
console.log("Poster -> src/assets/monsters-poster.png");
