// Sticker pipeline: turn each exhibit's art into a die-cut sticker PNG, the
// kind you would peel off a sheet. Transparent art gets a uniform white border
// grown from its alpha, so every sticker reads as one physical object no
// matter where its art came from.
//
//   node scripts/stickers-build.mjs
//
// out: src/assets/stickers/{gators,monsters,sword,pocketwild,kitchen,oldpond,monsterclub,terrarium}.png
//
//   ONLY=oldpond (or monsterclub, or terrarium) node scripts/stickers-build.mjs builds just that one, without
//   needing the other stickers' sources (some live in ~/Downloads).
//
// Photo cutouts (Haley, and the monster if Vision recognizes it) run through
// scripts/subject-lift.swift, Apple's on-device segmentation. Nothing leaves
// this machine. Lifts are cached in .stickers-work/ because the Swift
// invocation is the slow step; delete that folder to force a re-lift.
import { mkdir, writeFile, access } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import path from "node:path";
import sharp from "sharp";

const ROOT = new URL("..", import.meta.url).pathname;
const OUT = path.join(ROOT, "src/assets/stickers");
const WORK = path.join(ROOT, ".stickers-work");
await mkdir(OUT, { recursive: true });
await mkdir(WORK, { recursive: true });

const SRC = {
  // The full-length brand shot by the stove; Jake picked it 2026-07-30.
  haley: "/Users/jake/Documents/Misc/kitchenhappyrecipedefaults/Haley_Herridge_Headshot-7-2.jpeg",
  pocketwild: "/Users/jake/Documents/GitHub/pocketwild-website/app_sceenshots/IMG_5365.png",
  gator: path.join(ROOT, "src/assets/gators/gator-header.png"),
  monster: path.join(ROOT, "src/assets/monsters-header.png"),
  // The scanned magic sword, separated from the sheet by sword-ink-build.mjs.
  sword: path.join(ROOT, "src/assets/sword-ink/sword.png"),
  // From Where You Stand: Jake's Gemini ink render, one cylinder casting a
  // circle shadow on the floor and a square shadow on the wall (2026-08-15).
  perspective: "/Users/jake/Downloads/Gemini_Generated_Image_ns2cwhns2cwhns2c.jpeg",
  // Old Pond: the app's own frog, eyes open, already cut out (2026-11-10).
  oldpond: "/Users/jake/Documents/OldPond/App/Assets.xcassets/AldoOpen.imageset/aldo.png",
  // Monster Club: the Snaptooth tee mockup from the kids' clothing brand
  // (KidsBrand repo, gitignored master), Vision-lifted off its backdrop (2026-11-11).
  monsterclub: "/Users/jake/Documents/KidsBrand/tools/mockups/masters/snaptooth-tee.png",
  // Monster Terrarium: a monster-shaped pocket pet with a flat green screen,
  // rendered by OpenRouter (google/gemini-3.1-flash-image) on 2026-11-11 and
  // kept in the game's project folder. The tank gets painted into the screen.
  terrarium: "/Users/jake/Documents/TwelveEpicMonths/projects/09-monster-terrarium/work/sticker/device-1.png",
};

const exists = (p) => access(p).then(() => true, () => false);

function lift(input, cacheName, mode = []) {
  const out = path.join(WORK, cacheName);
  return exists(out).then(async (hit) => {
    if (!hit) {
      execFileSync("swift", [path.join(ROOT, "scripts/subject-lift.swift"), ...mode, input, out], {
        stdio: ["ignore", "inherit", "inherit"],
      });
    }
    return out;
  });
}

/**
 * The die cut. Fit the art in a box, grow its alpha outward into a smooth
 * blob (blur then threshold is a cheap dilation), fill that blob white, and
 * set the art back on top. The border is the sticker.
 */
async function dieCut(artBuf, { box = 1100, borderFrac = 0.032 } = {}) {
  const border = Math.round(box * borderFrac);
  const pad = border + 10;
  const art = await sharp(artBuf)
    .resize(box - pad * 2, box - pad * 2, { fit: "inside" })
    .png()
    .toBuffer();
  const m = await sharp(art).metadata();
  const W = m.width + pad * 2;
  const H = m.height + pad * 2;
  const centered = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: art, left: pad, top: pad }])
    .png()
    .toBuffer();
  // Solidify the alpha first so semi-transparent pixels still grow a full
  // border, then blur outward and keep anything the blur reached.
  const grown = await sharp(centered)
    .extractChannel(3)
    .toColourspace("b-w")
    .threshold(40)
    .blur(border / 2)
    .threshold(10)
    .blur(1.2)
    .raw()
    .toBuffer();
  // Fill enclosed holes: flood the outside from the canvas border; any clear
  // pixel the flood cannot reach is inside the die, so it becomes sticker
  // white. Solid art is unaffected. Line art (the sword) gets the solid white
  // backing a real sticker would have instead of see-through gaps.
  const outside = new Uint8Array(W * H);
  const q = new Int32Array(W * H);
  let qh = 0;
  let qt = 0;
  const push = (p) => {
    if (!outside[p] && grown[p] < 128) {
      outside[p] = 1;
      q[qt++] = p;
    }
  };
  for (let x = 0; x < W; x++) {
    push(x);
    push((H - 1) * W + x);
  }
  for (let y = 0; y < H; y++) {
    push(y * W);
    push(y * W + W - 1);
  }
  while (qh < qt) {
    const p = q[qh++];
    const x = p % W;
    if (x > 0) push(p - 1);
    if (x < W - 1) push(p + 1);
    if (p >= W) push(p - W);
    if (p < W * H - W) push(p + W);
  }
  const die = Buffer.alloc(W * H);
  for (let p = 0; p < W * H; p++) die[p] = outside[p] ? 0 : 255;
  const dieBuf = await sharp(die, { raw: { width: W, height: H, channels: 1 } })
    .blur(0.8)
    .png()
    .toBuffer();
  const white = await sharp({
    create: { width: W, height: H, channels: 3, background: "#ffffff" },
  })
    .joinChannel(dieBuf)
    .png()
    .toBuffer();
  return sharp(white).composite([{ input: centered }]).png({ compressionLevel: 9 }).toBuffer();
}

/** How much of the canvas the lift kept. Guards against a bad segmentation. */
async function coverage(buf) {
  const s = await sharp(buf).stats();
  return s.channels.length === 4 ? s.channels[3].mean / 255 : 1;
}

/**
 * Keep only the subject. Vision sometimes lifts scraps of scenery with the
 * person (a stove handle, a knob); those come out as small alpha islands
 * disconnected from the main silhouette. Drop every component smaller than a
 * twentieth of the biggest one.
 */
async function keepMajor(buf) {
  const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const N = W * H;
  const solid = new Uint8Array(N);
  for (let p = 0; p < N; p++) if (data[p * 4 + 3] > 40) solid[p] = 1;
  const label = new Int32Array(N);
  const queue = new Int32Array(N);
  const areas = [0];
  let next = 0;
  for (let s = 0; s < N; s++) {
    if (!solid[s] || label[s]) continue;
    const id = ++next;
    let qh = 0;
    let qt = 0;
    label[s] = id;
    queue[qt++] = s;
    let area = 0;
    while (qh < qt) {
      const p = queue[qh++];
      area++;
      const x = p % W;
      if (x > 0 && solid[p - 1] && !label[p - 1]) { label[p - 1] = id; queue[qt++] = p - 1; }
      if (x < W - 1 && solid[p + 1] && !label[p + 1]) { label[p + 1] = id; queue[qt++] = p + 1; }
      if (p >= W && solid[p - W] && !label[p - W]) { label[p - W] = id; queue[qt++] = p - W; }
      if (p < N - W && solid[p + W] && !label[p + W]) { label[p + W] = id; queue[qt++] = p + W; }
    }
    areas[id] = area;
  }
  const max = Math.max(...areas);
  const keep = areas.map((a) => a >= max / 20);
  let dropped = 0;
  for (let p = 0; p < N; p++) {
    if (label[p] && !keep[label[p]]) {
      data[p * 4 + 3] = 0;
      dropped++;
    }
  }
  if (dropped) console.log(`  keepMajor: erased ${dropped} px of stray scenery`);
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

// ---- pocketwild: the app screenshot inside the real iPhone render ----
// The frame is Jake's Gemini product shot, background lifted off, screen
// measured off the trimmed frame: 454x973 with the glass at (15,10) 424x950.
const PHONE_SRC = "/Users/jake/Downloads/Gemini_Generated_Image_lj6zgvlj6zgvlj6z.png";

const roundedRect = (w, h, r, fill = "#fff") =>
  Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="${fill}"/></svg>`);

async function iphoneSticker() {
  const frameP = path.join(WORK, "iphone-frame.png");
  if (!(await exists(frameP))) {
    const cut = await lift(PHONE_SRC, "iphone-cut.png");
    await sharp(cut).trim({ threshold: 8 }).toFile(frameP);
  }
  const SCR = { x: 15, y: 10, w: 424, h: 950 };
  // Cover, not contain: the screenshot is a whisker wider than this glass, and
  // cropping ~6px a side beats letterboxing.
  const shot = await sharp(SRC.pocketwild)
    .resize(SCR.w, SCR.h, { fit: "cover" })
    .composite([{ input: roundedRect(SCR.w, SCR.h, 58), blend: "dest-in" }])
    .png()
    .toBuffer();
  // The screenshot covers the baked Dynamic Island, so draw it back.
  const island = { w: 136, h: 37 };
  return sharp(frameP)
    .composite([
      { input: shot, left: SCR.x, top: SCR.y },
      {
        input: roundedRect(island.w, island.h, island.h / 2, "#0a0a0b"),
        left: SCR.x + Math.round((SCR.w - island.w) / 2),
        top: SCR.y + 12,
      },
    ])
    .png()
    .toBuffer();
}

// The sword sticker is Jake's scanned magic sword (aura, sparkles and all),
// straight from sword-ink-build.mjs. The die cut's hole fill gives the line
// art its solid white backing.

// ---- build them all ----
const jobs = [];

// Monster Club: the brand's Snaptooth tee, lifted off the mockup's backdrop
// and tilted a touch so it reads as a shirt sticker, not a product photo.
{
  const cut = await lift(SRC.monsterclub, "monsterclub-cut.png");
  const art = await sharp(cut).trim({ threshold: 8 }).png().toBuffer();
  const cov = await coverage(art);
  if (cov < 0.2 || cov > 0.95) throw new Error(`monsterclub lift coverage ${cov.toFixed(3)} looks wrong`);
  if (process.env.ONLY === "monsterclub") {
    const sticker = await sharp(await dieCut(art))
      .rotate(-4, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(path.join(OUT, "monsterclub.png"), sticker);
    const m = await sharp(sticker).metadata();
    console.log(`  monsterclub.png  ${m.width}x${m.height}  ${(sticker.length / 1024).toFixed(0)}kB`);
    process.exit(0);
  }
  jobs.push(["monsterclub", art, { tilt: -4 }]);
}

// Monster Terrarium: a new-age monster pocket pet (Jake's ask, 2026-11-11)
// whose screen is the tank. The toy is an OpenRouter image render with a flat
// green screen, kept in the game's project folder (work/sticker/device-1.png,
// made by make_device.mjs there). Vision lifts it off its white backdrop, and
// the screen gets the real tank: the game's colors and two of its own 96 px
// sprites (from public/terrarium, via terrarium-build.mjs), drawn at pixel
// scale and blown up 2x with hard edges, so the monsters on it are exact.
{
  const cut = await lift(SRC.terrarium, "terrarium-device-cut.png");
  // Find the screen in the original render: Vision sometimes counts part of a
  // flat green screen as background, so the lifted copy can't be trusted there.
  const dev = await sharp(SRC.terrarium).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const DW = dev.info.width;
  const DH = dev.info.height;
  const cm = await sharp(cut).metadata();
  if (cm.width !== DW || cm.height !== DH) throw new Error("terrarium lift changed the render's size");
  const d = dev.data;
  // The screen is the strongly green part of the toy.
  let screen = new Uint8Array(DW * DH);
  let sx0 = DW, sy0 = DH, sx1 = -1, sy1 = -1;
  for (let p = 0; p < DW * DH; p++) {
    const [r, g, b] = [d[p * 3], d[p * 3 + 1], d[p * 3 + 2]];
    if (g > 140 && g - Math.max(r, b) > 60) {
      screen[p] = 1;
      const x = p % DW, y = (p / DW) | 0;
      sx0 = Math.min(sx0, x); sx1 = Math.max(sx1, x); sy0 = Math.min(sy0, y); sy1 = Math.max(sy1, y);
    }
  }
  if (sx1 < 0) throw new Error("no green screen found in the terrarium device render");
  // The screen's rounded corners fade from green into the cream frame. Grow
  // from the solid green through anything still greenish, staying near the
  // screen, so the fringe gets covered without reaching the green body.
  {
    const stack = [];
    for (let p = 0; p < DW * DH; p++) if (screen[p]) stack.push(p);
    while (stack.length) {
      const p = stack.pop();
      const x = p % DW, y = (p / DW) | 0;
      for (const q of [x > 0 ? p - 1 : -1, x < DW - 1 ? p + 1 : -1, y > 0 ? p - DW : -1, y < DH - 1 ? p + DW : -1]) {
        if (q < 0 || screen[q]) continue;
        const qx = q % DW, qy = (q / DW) | 0;
        if (qx < sx0 - 10 || qx > sx1 + 10 || qy < sy0 - 10 || qy > sy1 + 10) continue;
        if (d[q * 3 + 1] - Math.max(d[q * 3], d[q * 3 + 2]) > 14) {
          screen[q] = 1;
          stack.push(q);
          sx0 = Math.min(sx0, qx); sx1 = Math.max(sx1, qx); sy0 = Math.min(sy0, qy); sy1 = Math.max(sy1, qy);
        }
      }
    }
  }
  // Then 2 px more, for the last antialiased edge.
  for (let pass = 0; pass < 2; pass++) {
    const grown = screen.slice();
    for (let p = 0; p < DW * DH; p++) {
      if (screen[p]) continue;
      const x = p % DW;
      if ((x > 0 && screen[p - 1]) || (x < DW - 1 && screen[p + 1]) || screen[p - DW] || screen[p + DW]) grown[p] = 1;
    }
    screen = grown;
  }
  sx0 -= 2; sy0 -= 2; sx1 += 2; sy1 += 2;
  const SW = sx1 - sx0 + 1;
  const SH = sy1 - sy0 + 1;

  // The tank at pixel scale, sized so 2x fills the screen.
  const K = 2;
  const PW = Math.floor(SW / K);
  const PH = Math.floor(SH / K);
  const px = Buffer.alloc(PW * PH * 4);
  const rect = (x, y, w, h, color) => {
    const c = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16));
    for (let yy = Math.max(0, y); yy < Math.min(PH, y + h); yy++)
      for (let xx = Math.max(0, x); xx < Math.min(PW, x + w); xx++) {
        const i = (yy * PW + xx) * 4;
        [px[i], px[i + 1], px[i + 2], px[i + 3]] = [...c, 255];
      }
  };
  const soilTop = PH - 34;
  rect(0, 0, PW, PH, "#c4d6ba");
  rect(0, soilTop, PW, PH - soilTop, "#684e3a");
  rect(0, soilTop, PW, 3, "#62844f");
  let seed = 9;
  const seeded = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let i = 0; i < 26; i++) rect(Math.floor(seeded() * (PW - 3)), soilTop + 6 + Math.floor(seeded() * 24), 3, 2, "#533e2e");
  for (const [x, h, c] of [[4, 34, "#577747"], [8, 50, "#6e9a57"], [12, 28, "#577747"], [PW - 9, 30, "#6e9a57"], [PW - 5, 42, "#577747"]]) {
    for (let y = 0; y < h; y++) rect(x + Math.round(Math.sin(y / 8)), soilTop + 2 - y, 2, 1, c);
  }
  // Two of the tank's monsters, facing each other: the dog in the box, and
  // the chunky gator lying on his side.
  const dir = path.join(ROOT, "public/terrarium");
  const cast = [
    ["17", 0.3, soilTop + 20, false],
    ["29", 0.72, soilTop + 25, true],
  ];
  const layers = [];
  for (const [id, fx, feet, flip] of cast) {
    let img = sharp(path.join(dir, `monster_${id}.png`));
    if (flip) img = img.flop();
    const buf = await img.png().toBuffer();
    const m = await sharp(buf).metadata();
    layers.push({ input: buf, left: Math.round(PW * fx - m.width / 2), top: feet - m.height });
  }
  const tankSmall = await sharp(px, { raw: { width: PW, height: PH, channels: 4 } }).composite(layers).png().toBuffer();
  // A faint sheen across the glass, the way a little LCD catches light.
  const sheen = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#fff" stop-opacity="0.22"/><stop offset="0.35" stop-color="#fff" stop-opacity="0.06"/>
      <stop offset="0.36" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>
    <rect width="${SW}" height="${SH}" fill="url(#g)"/></svg>`);
  // Separate steps on purpose: sharp runs one pipeline's operations in its own
  // order, and removeAlpha before the composite would leave 4 channels.
  const tankBig = await sharp(tankSmall)
    .resize(PW * K, PH * K, { kernel: "nearest" })
    .extend({ right: SW - PW * K, bottom: SH - PH * K, extendWith: "copy" })
    .png()
    .toBuffer();
  const tankLit = await sharp(tankBig).composite([{ input: sheen }]).png().toBuffer();
  const tankRGB = await sharp(tankLit).removeAlpha().raw().toBuffer();
  const mask = Buffer.alloc(SW * SH);
  for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) mask[y * SW + x] = screen[(y + sy0) * DW + (x + sx0)] ? 255 : 0;
  const screenImg = await sharp(tankRGB, { raw: { width: SW, height: SH, channels: 3 } })
    // extractChannel keeps the softened mask one channel wide; without it the
    // blur hands back three and the rows slide out of line.
    .joinChannel(await sharp(mask, { raw: { width: SW, height: SH, channels: 1 } }).blur(0.6).extractChannel(0).raw().toBuffer(), {
      raw: { width: SW, height: SH, channels: 1 },
    })
    .png()
    .toBuffer();
  const lit = await sharp(cut).composite([{ input: screenImg, left: sx0, top: sy0 }]).png().toBuffer();
  const art = await sharp(lit).trim({ threshold: 8 }).png().toBuffer();
  const cov = await coverage(art);
  if (cov < 0.3 || cov > 0.97) throw new Error(`terrarium lift coverage ${cov.toFixed(3)} looks wrong`);
  if (process.env.ONLY === "terrarium") {
    const sticker = await sharp(await dieCut(art))
      .rotate(-3, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
    await writeFile(path.join(OUT, "terrarium.png"), sticker);
    const m = await sharp(sticker).metadata();
    console.log(`  terrarium.png  ${m.width}x${m.height}  ${(sticker.length / 1024).toFixed(0)}kB`);
    process.exit(0);
  }
  jobs.push(["terrarium", art, { tilt: -3 }]);
}

// Old Pond: the app's frog sitting in a little puddle. His drawing already
// has a clean alpha. The puddle is drawn here the way the app draws water:
// flat teal, the same ink line as the frog, a few white ripple marks. His
// shadow is tall enough to fill the gaps between his legs, so no water
// shows through under him.
{
  const frog = await sharp(SRC.oldpond).trim({ threshold: 8 }).png().toBuffer();
  const fm = await sharp(frog).metadata();
  const W = Math.round(fm.width * 1.5);
  const puddleH = Math.round(fm.height * 0.3);
  const H = fm.height + Math.round(puddleH * 0.42);
  const cx = W / 2;
  const cy = H - puddleH / 2 - 6;
  const rx = W / 2 - 16;
  const ry = puddleH / 2 - 8;
  const line = 18; // the frog's outline is about this heavy at this size
  // A slightly lumpy oval, so it reads as drawn and not as a perfect ellipse.
  const blob = `M${cx - rx} ${cy + 4}
    C${cx - rx} ${cy - ry * 0.9} ${cx - rx * 0.45} ${cy - ry * 1.08} ${cx - rx * 0.05} ${cy - ry}
    S${cx + rx * 1.02} ${cy - ry * 0.95} ${cx + rx} ${cy - 2}
    S${cx + rx * 0.5} ${cy + ry * 1.06} ${cx + rx * 0.02} ${cy + ry}
    S${cx - rx} ${cy + ry * 0.9} ${cx - rx} ${cy + 4}Z`;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <path d="${blob}" fill="#6ECFC6" stroke="#2B2420" stroke-width="${line}" stroke-linejoin="round"/>
    <g fill="none" stroke="#ffffff" stroke-width="${line * 0.7}" stroke-linecap="round">
      <path d="M${cx - rx * 0.78} ${cy - ry * 0.1}q${rx * 0.11} ${-ry * 0.3} ${rx * 0.22} 0"/>
      <path d="M${cx + rx * 0.52} ${cy + ry * 0.38}q${rx * 0.12} ${-ry * 0.3} ${rx * 0.24} 0"/>
      <path d="M${cx - rx * 0.5} ${cy + ry * 0.55}q${rx * 0.09} ${-ry * 0.26} ${rx * 0.18} 0"/>
    </g>
    <ellipse cx="${cx}" cy="${cy + ry * 0.02}" rx="${fm.width * 0.4}" ry="${ry * 0.5}" fill="#2B2420"/>
  </svg>`;
  const art = await sharp({
    create: { width: W, height: H, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: Buffer.from(svg), left: 0, top: 0 },
      { input: frog, left: Math.round(cx - fm.width / 2), top: Math.round(cy + ry * 0.22 - fm.height) },
    ])
    .png()
    .toBuffer();
  if (process.env.ONLY === "oldpond") {
    const sticker = await dieCut(art);
    await writeFile(path.join(OUT, "oldpond.png"), sticker);
    const m = await sharp(sticker).metadata();
    console.log(`  oldpond.png  ${m.width}x${m.height}  ${(sticker.length / 1024).toFixed(0)}kB`);
    process.exit(0);
  }
  jobs.push(["oldpond", art]);
}

// Gator: already keyed to transparency by the header pipeline.
jobs.push(["gators", await sharp(SRC.gator).toBuffer()]);

// Kitchen Happy Club: the full photo, unstickered, with cute fruit and
// veggie stickers from Jake's Gemini sheet scattered over it. The sheet is
// Vision-lifted once (cached), split into items by connected components, and
// each item gets the standard die cut.
{
  const FRUIT_SHEET = path.join(WORK, "fruit-cut.png");
  if (!(await exists(FRUIT_SHEET))) {
    throw new Error("fruit-cut.png missing; lift the Gemini fruit sheet into .stickers-work first");
  }

  // Split the sheet into items: label alpha components, then merge the multi
  // part drawings (cherries and their stems, the two garlic bulbs) by bbox
  // proximity. Items are identified by their spot in the 3x3 layout.
  const { data, info } = await sharp(FRUIT_SHEET).raw().toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  const N = W * H;
  const solid = new Uint8Array(N);
  for (let p = 0; p < N; p++) if (data[p * 4 + 3] > 40) solid[p] = 1;
  const label = new Int32Array(N);
  const queue = new Int32Array(N);
  const boxes = [];
  let next = 0;
  for (let s = 0; s < N; s++) {
    if (!solid[s] || label[s]) continue;
    const id = ++next;
    let qh = 0, qt = 0, area = 0;
    let x0 = W, y0 = H, x1 = 0, y1 = 0;
    label[s] = id;
    queue[qt++] = s;
    while (qh < qt) {
      const p = queue[qh++];
      const x = p % W;
      area++;
      const y = (p / W) | 0;
      if (x < x0) x0 = x;
      if (x > x1) x1 = x;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
      if (x > 0 && solid[p - 1] && !label[p - 1]) { label[p - 1] = id; queue[qt++] = p - 1; }
      if (x < W - 1 && solid[p + 1] && !label[p + 1]) { label[p + 1] = id; queue[qt++] = p + 1; }
      if (p >= W && solid[p - W] && !label[p - W]) { label[p - W] = id; queue[qt++] = p - W; }
      if (p < N - W && solid[p + W] && !label[p + W]) { label[p + W] = id; queue[qt++] = p + W; }
    }
    if (area > 300) boxes.push({ x0, y0, x1, y1 });
  }
  // The sheet is a 3x3 layout, so group components by which cell their
  // centroid lands in; a cell's item is the union of its components (the
  // cherries and their stems, the two garlic bulbs). Distance-based merging
  // over-merged: adjacent items' bounding boxes nearly touch.
  const cells = new Map();
  for (const b of boxes) {
    const key = `${Math.floor((b.y0 + b.y1) / 2 / (H / 3))},${Math.floor((b.x0 + b.x1) / 2 / (W / 3))}`;
    const c = cells.get(key);
    cells.set(
      key,
      c
        ? {
            x0: Math.min(c.x0, b.x0),
            y0: Math.min(c.y0, b.y0),
            x1: Math.max(c.x1, b.x1),
            y1: Math.max(c.y1, b.y1),
          }
        : { ...b },
    );
  }
  const itemAt = (row, col) => cells.get(`${row},${col}`);
  const PICKS = [
    { name: "lemon", box: itemAt(0, 1) },
    { name: "strawberry", box: itemAt(0, 0) },
    { name: "avocado", box: itemAt(1, 2) },
  ].filter((p) => p.box);
  if (PICKS.length < 3) throw new Error(`fruit split found only ${PICKS.length} of the picks`);

  const roundedSvg = (w, h, r) =>
    Buffer.from(`<svg width="${w}" height="${h}"><rect width="${w}" height="${h}" rx="${r}" fill="#fff"/></svg>`);

  async function fruitSticker(box, i, size) {
    const art = await sharp(FRUIT_SHEET)
      .extract({ left: box.x0, top: box.y0, width: box.x1 - box.x0 + 1, height: box.y1 - box.y0 + 1 })
      .toBuffer();
    const cut = await dieCut(art, { box: size, borderFrac: 0.05 });
    const rot = [-9, 8, -6, 10, -7][i % 5];
    const rotated = await sharp(cut)
      .rotate(rot, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer();
    const m = await sharp(rotated).metadata();
    const shadowImg = await sharp({
      create: { width: m.width, height: m.height, channels: 3, background: "#1b1a17" },
    })
      .joinChannel(await sharp(rotated).extractChannel(3).toColourspace("b-w").blur(8).png().toBuffer())
      .png()
      .toBuffer();
    return { rotated, shadowImg, w: m.width, h: m.height };
  }

  const baseH = 1400;
  const base = await sharp(SRC.haley).resize({ height: baseH }).png().toBuffer();
  const bm = await sharp(base).metadata();
  const rounded = await sharp(base)
    .composite([{ input: roundedSvg(bm.width, bm.height, 26), blend: "dest-in" }])
    .png()
    .toBuffer();

  // A wide margin so the stickers genuinely hang off the photo's edges;
  // roughly half of each sticker sits outside the picture. That overhang is
  // the 3D effect.
  const M = 120;
  const canvasW = bm.width + M * 2;
  const canvasH = bm.height + M * 2;
  const comps = [{ input: rounded, left: M, top: M }];
  // Three fruits, all riding an edge. None over her face.
  const spots = [
    { x: 4, y: 44, size: 350 }, // lemon, hanging off the top left
    { x: canvasW - 410, y: canvasH - 700, size: 400 }, // strawberry, big, off the right
    { x: 8, y: canvasH - 520, size: 340 }, // avocado, off the bottom left
  ];
  for (let i = 0; i < PICKS.length; i++) {
    const s = await fruitSticker(PICKS[i].box, i, spots[i].size);
    comps.push({ input: s.shadowImg, left: spots[i].x + 3, top: spots[i].y + 10, blend: "multiply" });
    comps.push({ input: s.rotated, left: spots[i].x, top: spots[i].y });
  }
  const composed = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite(comps)
    .png({ compressionLevel: 9 })
    .toBuffer();
  jobs.push(["kitchen", composed, { raw: true }]);
}

// Monster: try the same lift on the colored drawing; fall back to keying the
// paper if Vision does not see a subject in an illustration.
{
  let buf = null;
  try {
    const cut = await lift(SRC.monster, "monster-cut.png");
    const t = await sharp(cut).trim({ threshold: 8 }).toBuffer();
    const cov = await coverage(t);
    if (cov >= 0.08 && cov <= 0.95) buf = t;
    else console.log(`  monster lift coverage ${cov.toFixed(3)}, using chroma fallback`);
  } catch {
    console.log("  monster lift failed, using chroma fallback");
  }
  if (!buf) {
    // Global chroma key on the paper tone, soft ramp, same idea as
    // gator-header-key.mjs. Enclosed paper pockets inside the monster will
    // key too; acceptable for a fallback, Vision is the preferred path.
    const { data, info } = await sharp(SRC.monster).raw().toBuffer({ resolveWithObject: true });
    const bg = [data[40], data[41], data[42]]; // paper sampled near the corner
    const HARD = 1400;
    const SOFT = 5200;
    const out = Buffer.alloc(info.width * info.height * 4);
    for (let i = 0, n = info.width * info.height; i < n; i++) {
      const r = data[i * 3], g = data[i * 3 + 1], b = data[i * 3 + 2];
      const d = (r - bg[0]) ** 2 + (g - bg[1]) ** 2 + (b - bg[2]) ** 2;
      const a = d <= HARD ? 0 : d >= SOFT ? 255 : Math.round(((d - HARD) / (SOFT - HARD)) * 255);
      out[i * 4] = r; out[i * 4 + 1] = g; out[i * 4 + 2] = b; out[i * 4 + 3] = a;
    }
    buf = await sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
      .trim({ threshold: 8 })
      .png()
      .toBuffer();
  }
  jobs.push(["monsters", buf]);
}

// PocketWild: screenshot in the drawn phone, with og Aldo stickered over the
// corner. He is the app's actual idle-bob frame, scaled nearest-neighbour so
// the pixels stay pixels.
{
  const phone = await dieCut(await iphoneSticker());
  const ALDO =
    "/Users/jake/Documents/EntryNo138/app/EntryNo138/EntryNo138/Assets.xcassets/frog-bob.imageset/frog-bob.png";
  const frame = await sharp(ALDO)
    .extract({ left: 0, top: 0, width: 128, height: 128 })
    .resize(384, 384, { kernel: "nearest" })
    .png()
    .toBuffer();
  const aldoSticker = await sharp(await dieCut(frame, { box: 440, borderFrac: 0.045 }))
    .resize({ width: 250 })
    .rotate(-7, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  const am = await sharp(aldoSticker).metadata();
  const aldoShadow = await sharp({
    create: { width: am.width, height: am.height, channels: 3, background: "#1b1a17" },
  })
    .joinChannel(await sharp(aldoSticker).extractChannel(3).toColourspace("b-w").blur(8).png().toBuffer())
    .png()
    .toBuffer();
  const pm = await sharp(phone).metadata();
  // Room for him to hang off the phone's edge.
  const canvasW = pm.width + 60;
  const canvasH = pm.height + 24;
  const pos = { left: canvasW - am.width - 4, top: Math.round(canvasH * 0.62) };
  const composed = await sharp({
    create: { width: canvasW, height: canvasH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([
      { input: phone, left: 0, top: 0 },
      { input: aldoShadow, left: pos.left + 3, top: pos.top + 10, blend: "multiply" },
      { input: aldoSticker, left: pos.left, top: pos.top },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
  jobs.push(["pocketwild", composed, { raw: true }]);
}

// Sword: the real drawing.
jobs.push(["sword", await sharp(SRC.sword).toBuffer()]);

// From Where You Stand: Vision lifts the cylinder and both of its shadows as
// one piece. The render's drawn horizon line rides along as a thin whisker
// off the square shadow's left edge; erase that corner of the lift (nothing
// else lives there) and let the die cut swallow the stub.
{
  const cut = await lift(SRC.perspective, "perspective-cut.png");
  const trimmed = await sharp(cut).trim({ threshold: 8 }).toBuffer();
  const { data, info } = await sharp(trimmed)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const W = info.width;
  const H = info.height;
  for (let y = 0; y < Math.round(H * 0.72); y++)
    for (let x = 0; x < Math.round(W * 0.26); x++) data[(y * W + x) * 4 + 3] = 0;
  const art = await sharp(data, { raw: { width: W, height: H, channels: 4 } })
    .trim({ threshold: 8 })
    .png()
    .toBuffer();
  jobs.push(["perspective", art]);
}

for (const [name, art, opts] of jobs) {
  // raw skips the die cut: the kitchen card is a photo with stickers ON it,
  // not a sticker itself.
  let sticker = opts?.raw ? art : await dieCut(art);
  if (opts?.tilt) {
    sticker = await sharp(sticker)
      .rotate(opts.tilt, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png({ compressionLevel: 9 })
      .toBuffer();
  }
  const file = path.join(OUT, `${name}.png`);
  await writeFile(file, sticker);
  const m = await sharp(sticker).metadata();
  console.log(`  ${name}.png  ${m.width}x${m.height}  ${(sticker.length / 1024).toFixed(0)}kB`);
}
console.log(`stickers -> src/assets/stickers/`);
