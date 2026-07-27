// One-time asset pipeline for the gator machine.
// Reads the original 3000x3000 layer PNGs from ~/Documents/GlitchyGators,
// writes web-ready WebP layers + thumbnails into public/gators/, and a
// manifest into src/data/gator-machine.json (categories in stack order).
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "/Users/jake/Documents/GlitchyGators";
const OUT = new URL("../public/gators", import.meta.url).pathname;
const MANIFEST = new URL("../src/data/gator-machine.json", import.meta.url).pathname;

// Stack order is meaningful: background at the bottom, head on top.
const CATEGORIES = [
  { id: "background", label: "Background", dir: "Backgrounds", strip: /^BG/ },
  { id: "body", label: "Body", dir: "Bodies", strip: /^(Bodies|Body|Final)/ },
  { id: "arms", label: "Arms", dir: "Arms", strip: /^Arms/ },
  { id: "mouth", label: "Mouth", dir: "Mouths", strip: /^(Mouths|Mouth)/ },
  { id: "eyes", label: "Eyes", dir: "Eyes", strip: /^(Eyes|Etyes)/ },
  { id: "head", label: "Head", dir: "Heads", strip: /^(Heads|Head)/ },
];

const LAYER_SIZE = 800;
const THUMB_SIZE = 176;

const slugify = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase();

const displayName = (s) =>
  s
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/(\d+)/g, " $1")
    .trim();

const manifest = { size: LAYER_SIZE, categories: [] };

for (const cat of CATEGORIES) {
  const srcDir = path.join(SRC, cat.dir);
  const files = (await readdir(srcDir))
    .filter((f) => f.toLowerCase().endsWith(".png") && !/copy/i.test(f))
    .sort();
  const layerOut = path.join(OUT, "layers", cat.id);
  const thumbOut = path.join(OUT, "thumbs", cat.id);
  await mkdir(layerOut, { recursive: true });
  await mkdir(thumbOut, { recursive: true });

  const items = [];
  for (const f of files) {
    const base = f.replace(/#\d+\.png$/i, "").replace(/\.png$/i, "");
    const cleaned = base.replace(cat.strip, "") || base;
    const slug = slugify(cleaned);
    const name = displayName(cleaned);
    const input = sharp(path.join(srcDir, f));
    await input
      .clone()
      .resize(LAYER_SIZE, LAYER_SIZE)
      .webp({ quality: 82 })
      .toFile(path.join(layerOut, `${slug}.webp`));
    await input
      .clone()
      .resize(THUMB_SIZE, THUMB_SIZE)
      .webp({ quality: 72 })
      .toFile(path.join(thumbOut, `${slug}.webp`));
    items.push({ slug, name });
  }
  manifest.categories.push({ id: cat.id, label: cat.label, items });
  console.log(`${cat.label}: ${items.length} layers`);
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`Manifest -> ${MANIFEST}`);
