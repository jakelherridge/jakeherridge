// Asset + data pipeline for the PocketWild exhibit.
// Sources: the real app project at ~/Documents/EntryNo138.
//  - SpritesV2/*.png            -> public/pocketwild/sprites/<n>.png
//  - icon_mascot-aldo.png       -> public/pocketwild/aldo.png
//  - species_v1.csv + aldo_seed_output.csv -> public/pocketwild/species.json
//    (full guide) + src/data/pocketwild-index.json (light index for SSR)
//  - CreatureNamePool.swift     -> public/pocketwild/names.json
import { readdir, mkdir, readFile, writeFile, copyFile } from "node:fs/promises";
import path from "node:path";

const APP = "/Users/jake/Documents/EntryNo138";
const SPRITES = path.join(APP, "app/EntryNo138/EntryNo138/Resources/SpritesV2");
const ALDO = path.join(APP, "app/EntryNo138/EntryNo138/Resources/ConditionIcons/icon_mascot-aldo.png");
const SPECIES_CSV = path.join(APP, "data/species/species_v1.csv.csv");
const ALDO_CSV = path.join(APP, "tools/aldo_seed_output.csv");
const NAMES_SWIFT = path.join(APP, "app/EntryNo138/EntryNo138/Features/Capture/CreatureNamePool.swift");

const PUB = new URL("../public/pocketwild", import.meta.url).pathname;
const IDX = new URL("../src/data/pocketwild-index.json", import.meta.url).pathname;

// Minimal CSV parser that honors quoted fields.
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += ch;
    } else if (ch === '"') inQ = true;
    else if (ch === ",") { row.push(field); field = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (field !== "" || row.length) { row.push(field); rows.push(row); row = []; field = ""; }
      if (ch === "\r" && text[i + 1] === "\n") i++;
    } else field += ch;
  }
  if (field !== "" || row.length) { row.push(field); rows.push(row); }
  const [head, ...rest] = rows;
  return rest.map((r) => Object.fromEntries(head.map((h, i) => [h, r[i] ?? ""])));
}

await mkdir(path.join(PUB, "sprites"), { recursive: true });

// Sprites: v2_sprite_038_eastern_western_meadowlark.png -> 38.png
const spriteFiles = (await readdir(SPRITES)).filter((f) => f.endsWith(".png"));
const spriteByNum = new Map();
for (const f of spriteFiles) {
  const m = f.match(/^v2_sprite_(\d+)_/);
  if (!m) continue;
  const n = parseInt(m[1], 10);
  spriteByNum.set(n, f);
  await copyFile(path.join(SPRITES, f), path.join(PUB, "sprites", `${n}.png`));
}
await copyFile(ALDO, path.join(PUB, "aldo.png"));
console.log(`Sprites: ${spriteByNum.size} copied, plus Aldo`);

// Species: merge the two CSVs on pokedex_number.
const base = parseCsv(await readFile(SPECIES_CSV, "utf8"));
const aldo = parseCsv(await readFile(ALDO_CSV, "utf8"));
const aldoByNum = new Map(aldo.map((r) => [parseInt(r.pokedex_number, 10), r]));

const species = base
  .map((r) => {
    const n = parseInt(r.pokedex_number, 10);
    const a = aldoByNum.get(n);
    return {
      n,
      name: r.common_name,
      sci: r.scientific_name,
      category: r.category,
      range: r.range,
      habitat: r.habitat,
      season: r.best_season,
      rarity: r.rarity,
      aldo: a
        ? {
            facts: [a.fun_fact_1, a.fun_fact_2, a.fun_fact_3].filter(Boolean),
            size: a.size_summary,
            look: a.description_summary,
            home: a.habitat_summary,
          }
        : null,
    };
  })
  .filter((s) => spriteByNum.has(s.n))
  .sort((x, y) => x.n - y.n);

await writeFile(path.join(PUB, "species.json"), JSON.stringify({ species }));
await writeFile(
  IDX,
  JSON.stringify(
    species.map(({ n, name, category, rarity }) => ({ n, name, category, rarity })),
    null,
    2,
  ),
);
console.log(`Species: ${species.length} merged (${species.filter((s) => s.aldo).length} with Aldo facts)`);

// Name pools: pull each `let <key>: [String] = [ ... ]` block's quoted strings.
const swift = await readFile(NAMES_SWIFT, "utf8");
function pool(key) {
  const m = swift.match(new RegExp(`let ${key}: \\[String\\] = \\[([\\s\\S]*?)\\n    \\]`));
  if (!m) return [];
  return [...m[1].matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1]);
}
const names = {
  universal: pool("universal"),
  pools: {
    bird: pool("bird"),
    mammal: pool("mammal"),
    tree: pool("tree"),
    wildflower: pool("wildflower"),
    insect: pool("insect"),
    reptile: pool("reptile"),
    fish: pool("fish"),
    mushroom: pool("mushroom"),
  },
  adjectives: pool("universalAdjectives"),
  universalNameProbability: 0.3,
  compoundProbability: 0.25,
};
await writeFile(path.join(PUB, "names.json"), JSON.stringify(names));
const counts = Object.entries(names.pools).map(([k, v]) => `${k}:${v.length}`).join(" ");
console.log(`Names: universal:${names.universal.length} ${counts} adjectives:${names.adjectives.length}`);

// Poster: a 3x3 sprite collage on paper for the exhibits wall.
const sharp = (await import("sharp")).default;
const POSTER_PICKS = [1, 23, 61, 96, 121, 146, 166, 186, 214];
const cellW = 300, cellH = 225, cols = 3;
const composites = [];
for (let i = 0; i < POSTER_PICKS.length; i++) {
  const n = POSTER_PICKS[i];
  const file = path.join(PUB, "sprites", `${n}.png`);
  const meta = await sharp(file).metadata();
  const scale = Math.min((cellW * 0.55) / meta.width, (cellH * 0.8) / meta.height);
  const w = Math.round(meta.width * scale), h = Math.round(meta.height * scale);
  const buf = await sharp(file).resize(w, h, { kernel: "nearest" }).toBuffer();
  composites.push({
    input: buf,
    left: (i % cols) * cellW + Math.round((cellW - w) / 2),
    top: Math.floor(i / cols) * cellH + Math.round((cellH - h) / 2),
  });
}
await sharp({
  create: { width: cellW * 3, height: cellH * 3, channels: 4, background: "#f4f1e9" },
})
  .composite(composites)
  .png()
  .toFile(new URL("../src/assets/pocketwild-poster.png", import.meta.url).pathname);
console.log("Poster collage -> src/assets/pocketwild-poster.png");
