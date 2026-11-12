// Monster Terrarium room assets. Copies the game's sprites out of the project
// folder and makes the one before/after example, so the room shows exactly
// what the game uses. Rerun after the sprites change.
//
//   node scripts/terrarium-build.mjs
//
// in:  the game's sprites (TwelveEpicMonths project #9), Jake's colored pages
// out: public/terrarium/monster_NN.png, public/terrarium/page-NN.webp,
//      src/data/terrarium.json
import { mkdir, readdir, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const PROJECT = "/Users/jake/Documents/TwelveEpicMonths/projects/09-monster-terrarium/work";
const SPRITES = path.join(PROJECT, "sprites");
const PAGES = "/Users/jake/Documents/KidsBrand/art/color";
const OUT = path.join(ROOT, "public/terrarium");
// The example in "From page to pixels".
const EXAMPLE = "17";

await mkdir(OUT, { recursive: true });

const files = (await readdir(SPRITES)).filter((f) => /^monster_\d+\.png$/.test(f)).sort();
if (files.length === 0) throw new Error(`no sprites in ${SPRITES}`);

const monsters = [];
for (const f of files) {
  const id = f.match(/\d+/)[0];
  await copyFile(path.join(SPRITES, f), path.join(OUT, f));
  const m = await sharp(path.join(SPRITES, f)).metadata();
  monsters.push({ id, title: `Monster ${id}`, src: `/terrarium/${f}`, w: m.width, h: m.height });
}

// The colored page the example sprite was made from, small enough for the web.
const page = await sharp(path.join(PAGES, `${EXAMPLE}.png`))
  .resize({ height: 640 })
  .webp({ quality: 82 })
  .toBuffer();
await writeFile(path.join(OUT, `page-${EXAMPLE}.webp`), page);
const pm = await sharp(page).metadata();

await writeFile(
  path.join(ROOT, "src/data/terrarium.json"),
  JSON.stringify(
    { monsters, example: { id: EXAMPLE, page: `/terrarium/page-${EXAMPLE}.webp`, w: pm.width, h: pm.height } },
    null,
    2,
  ) + "\n",
);
console.log(`terrarium: ${monsters.length} sprites, example page ${pm.width}x${pm.height}`);
