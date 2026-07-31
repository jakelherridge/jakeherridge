// Boy and the Sword ink assets: split Jake's scanned sheet into transparent
// PNGs, one per drawing, with the grid paper removed.
//
//   node scripts/sword-ink-build.mjs
//
// in:  ~/Downloads/boyandswordartassets.tif (3498x4962 grayscale, grid paper)
// out: src/assets/sword-ink/{sword,stick,fish,egg,wood,fire}.png
//
// The drawings interlock on the page (the fire's flames reach into the log
// pile's box), so plain crops would cross-contaminate. Instead: threshold the
// ink, label every connected component, and give each asset the components
// whose centroid falls in its region. The plain sword with the X through it is
// deliberately unassigned; Jake marked it discard.
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SRC = "/Users/jake/Downloads/boyandswordartassets.tif";
const OUT = new URL("../src/assets/sword-ink/", import.meta.url).pathname;
await mkdir(OUT, { recursive: true });

// Ink vs paper: the grid scans light grey, the pen near-black.
const INK_BELOW = 140;
// Scanner dust: anything smaller than this many pixels is noise, not drawing.
const MIN_AREA = 120;
const TARGET = 1000; // longest output side

// Regions in full-scan pixels, measured off a 1400px preview (factor 3.544).
// Generous on purpose; centroids decide ownership, not edges.
const ASSETS = [
  { name: "sword", box: [120, 280, 1720, 1560] }, // magic sword + sparkles
  { name: "stick", box: [2380, 250, 3470, 1880] },
  { name: "fish", box: [700, 1600, 2200, 2520] },
  { name: "egg", box: [430, 2590, 1830, 3450] },
  { name: "wood", box: [2020, 3240, 3100, 4260] },
  { name: "fire", box: [1200, 3600, 2360, 4900] },
];

const { data, info } = await sharp(SRC).greyscale().raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const H = info.height;
const N = W * H;

// Ink mask.
const ink = new Uint8Array(N);
for (let i = 0; i < N; i++) if (data[i] < INK_BELOW) ink[i] = 1;

// Connected components, 4-neighbour BFS.
const label = new Int32Array(N); // 0 = unlabelled
const queue = new Int32Array(N);
let nextLabel = 0;
const comps = []; // {id, area, cx, cy, x0, y0, x1, y1}
for (let start = 0; start < N; start++) {
  if (!ink[start] || label[start]) continue;
  const id = ++nextLabel;
  let qh = 0;
  let qt = 0;
  label[start] = id;
  queue[qt++] = start;
  let area = 0;
  let sx = 0;
  let sy = 0;
  let x0 = W;
  let y0 = H;
  let x1 = 0;
  let y1 = 0;
  while (qh < qt) {
    const p = queue[qh++];
    const x = p % W;
    const y = (p / W) | 0;
    area++;
    sx += x;
    sy += y;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
    if (x > 0 && ink[p - 1] && !label[p - 1]) {
      label[p - 1] = id;
      queue[qt++] = p - 1;
    }
    if (x < W - 1 && ink[p + 1] && !label[p + 1]) {
      label[p + 1] = id;
      queue[qt++] = p + 1;
    }
    if (p >= W && ink[p - W] && !label[p - W]) {
      label[p - W] = id;
      queue[qt++] = p - W;
    }
    if (p < N - W && ink[p + W] && !label[p + W]) {
      label[p + W] = id;
      queue[qt++] = p + W;
    }
  }
  comps.push({ id, area, cx: sx / area, cy: sy / area, x0, y0, x1, y1 });
}

const usable = comps.filter((c) => c.area >= MIN_AREA);
console.log(`${comps.length} components, ${usable.length} above dust size`);

const claimed = new Set();
for (const a of ASSETS) {
  const [bx0, by0, bx1, by1] = a.box;
  const mine = usable.filter(
    (c) => !claimed.has(c.id) && c.cx >= bx0 && c.cx <= bx1 && c.cy >= by0 && c.cy <= by1,
  );
  if (!mine.length) throw new Error(`${a.name}: no components found in its region`);
  mine.forEach((c) => claimed.add(c.id));
  const ids = new Set(mine.map((c) => c.id));

  // Union bbox plus a little air.
  const pad = 14;
  const x0 = Math.max(0, Math.min(...mine.map((c) => c.x0)) - pad);
  const y0 = Math.max(0, Math.min(...mine.map((c) => c.y0)) - pad);
  const x1 = Math.min(W - 1, Math.max(...mine.map((c) => c.x1)) + pad);
  const y1 = Math.min(H - 1, Math.max(...mine.map((c) => c.y1)) + pad);
  const cw = x1 - x0 + 1;
  const ch = y1 - y0 + 1;

  // Render just this asset's components: ink black, everything else clear.
  // Grey source values survive inside strokes so the pen keeps its texture.
  const out = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) {
    for (let x = 0; x < cw; x++) {
      const p = (y0 + y) * W + (x0 + x);
      if (ids.has(label[p])) {
        const o = (y * cw + x) * 4;
        const v = data[p];
        out[o] = out[o + 1] = out[o + 2] = Math.min(v, 40);
        out[o + 3] = 255;
      }
    }
  }
  await sharp(out, { raw: { width: cw, height: ch, channels: 4 } })
    .resize(TARGET, TARGET, { fit: "inside", withoutEnlargement: true })
    .png({ compressionLevel: 9 })
    .toFile(path.join(OUT, `${a.name}.png`));
  console.log(
    `  ${a.name}: ${mine.length} components, ${cw}x${ch} -> ${path.join("src/assets/sword-ink", a.name + ".png")}`,
  );
}

const orphans = usable.filter((c) => !claimed.has(c.id));
console.log(
  `${orphans.length} components left unassigned (the X'd sword and stray marks), total area ${orphans.reduce((n, c) => n + c.area, 0)}`,
);
