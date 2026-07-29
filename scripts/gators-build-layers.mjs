// Asset pipeline for the gator machine.
// Reads the final attribute set from ~/Documents/GlitchyGators/Final Gators
// (327 layers, including the Glitchy variants, each filename carrying the
// generator's rarity weight as "#NN"), and writes:
//   public/gators/layers/<cat>/<slug>.webp   full frame, alignment preserved
//   public/gators/thumbs/<cat>/<slug>.webp   TRIMMED to the ink, so small
//                                            parts like eyes are readable
//   src/data/gator-machine.json              manifest in stack order, weights
// Also refreshes the Favorites wall images.
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "/Users/jake/Documents/GlitchyGators/Final Gators";
const FAVS = "/Users/jake/Documents/GlitchyGators/Old Gators/Favorites";
const OUT = new URL("../public/gators", import.meta.url).pathname;
const MANIFEST = new URL("../src/data/gator-machine.json", import.meta.url).pathname;

// Stack order is meaningful: background at the bottom, head on top.
// Eyes sit above mouth, per the generator.
const CATEGORIES = [
  { id: "background", label: "Background", dir: "Background" },
  { id: "body", label: "Body", dir: "Body" },
  { id: "arms", label: "Arms", dir: "Arms" },
  { id: "mouth", label: "Mouth", dir: "Mouth" },
  { id: "eyes", label: "Eyes", dir: "Eyes" },
  { id: "head", label: "Head", dir: "Head" },
];

// 600px covers the stage (renders ~400 CSS px) at retina and halves the
// bytes versus 800. Backgrounds are full-frame pattern art and by far the
// heaviest layers, so they take extra compression; nobody reads detail in
// a backdrop the gator is standing on.
const LAYER_SIZE = 600;
const LAYER_Q = 76;
const BACKGROUND_Q = 62;
const THUMB_SIZE = 144;
const THUMB_PAD = 8; // breathing room inside the swatch

const slugify = (s) =>
  s
    .normalize("NFKD")
    .replace(/['’]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();

const manifest = { size: LAYER_SIZE, categories: [] };

for (const cat of CATEGORIES) {
  const srcDir = path.join(SRC, cat.dir);
  const files = (await readdir(srcDir)).filter((f) => f.toLowerCase().endsWith(".png")).sort();
  const layerOut = path.join(OUT, "layers", cat.id);
  const thumbOut = path.join(OUT, "thumbs", cat.id);
  await mkdir(layerOut, { recursive: true });
  await mkdir(thumbOut, { recursive: true });

  const items = [];
  const seen = new Set();
  for (const f of files) {
    const base = f.replace(/\.png$/i, "");
    const m = base.match(/^(.*?)#(\d+)$/);
    const rawName = (m ? m[1] : base).trim();
    const weight = m ? parseInt(m[2], 10) : 50;
    let slug = slugify(rawName);
    while (seen.has(slug)) slug += "-2";
    seen.add(slug);
    // Keep "Glitchy" in the display name: it is the whole point of the club.
    const glitchy = /glitchy/i.test(rawName);
    const name = rawName;

    if (process.env.MANIFEST_ONLY) {
      items.push({ slug, name, weight, ...(glitchy ? { glitchy: true } : {}) });
      continue;
    }

    const input = sharp(path.join(srcDir, f));

    // Full frame: never trimmed, so layers keep their alignment. (Trimming
    // these would make them BIGGER: transparent space compresses to almost
    // nothing, while a cropped layer is dense pixels edge to edge.)
    await input
      .clone()
      .resize(LAYER_SIZE, LAYER_SIZE)
      .webp({ quality: cat.id === "background" ? BACKGROUND_Q : LAYER_Q, effort: 6 })
      .toFile(path.join(layerOut, `${slug}.webp`));

    // Thumbnail: trim to the ink, then center in the swatch. Backgrounds
    // fill the frame already, so the trim is a no-op for them.
    let thumb = input.clone();
    try {
      const trimmed = await input.clone().trim({ threshold: 1 }).toBuffer();
      thumb = sharp(trimmed);
    } catch {
      /* fully uniform layer: keep the original */
    }
    await thumb
      .resize(THUMB_SIZE - THUMB_PAD * 2, THUMB_SIZE - THUMB_PAD * 2, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .extend({
        top: THUMB_PAD,
        bottom: THUMB_PAD,
        left: THUMB_PAD,
        right: THUMB_PAD,
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .webp({ quality: 72 })
      .toFile(path.join(thumbOut, `${slug}.webp`));

    items.push({ slug, name, weight, ...(glitchy ? { glitchy: true } : {}) });
  }
  manifest.categories.push({ id: cat.id, label: cat.label, items });
  const g = items.filter((i) => i.glitchy).length;
  console.log(`${cat.label.padEnd(11)} ${String(items.length).padStart(3)} layers (${g} glitchy)`);
}

await writeFile(MANIFEST, JSON.stringify(manifest));
const combos = manifest.categories.reduce((n, c) => n * c.items.length, 1);
console.log(`\nManifest -> src/data/gator-machine.json`);
console.log(`Combinations: ${combos.toLocaleString("en-US")}`);

// Favorites: full composed gators named by token number, for the wall.
const FAV_OUT = new URL("../src/assets/gators-wall", import.meta.url).pathname;
await mkdir(FAV_OUT, { recursive: true });
const favs = (await readdir(FAVS)).filter((f) => f.toLowerCase().endsWith(".png"));
for (const f of favs) {
  const token = f.replace(/\.png$/i, "");
  await sharp(path.join(FAVS, f))
    .resize(900, 900)
    .webp({ quality: 82 })
    .toFile(path.join(FAV_OUT, `${token}.webp`));
}
console.log(`Favorites: ${favs.length} wall gators`);
