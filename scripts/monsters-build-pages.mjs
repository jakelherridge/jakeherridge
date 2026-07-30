// Monster Book pipeline: turn the print scans into free printable coloring
// sheets, plus the web assets the room needs.
//
//   node scripts/monsters-build-pages.mjs
//
// in:  ~/Documents/Scans-Monsters-Work/print/monster_0NN.png
//      3508x4961 grayscale, already ~99.98% pure black and white
//
// out: public/monsters/print/NN-letter.pdf  US Letter portrait, print ready
//      public/monsters/print/NN-a4.pdf      A4 portrait, print ready
//      public/monsters/print/NN.png         2550x3300, 300dpi, black and white
//      public/monsters/pages/NN.png         web page for the coloring canvas
//      public/monsters/thumbs/NN.webp       gallery thumbnail
//      src/data/monsters.json               manifest the room reads
//
// Adding a monster is: drop the scan in, rerun this, commit. Nothing is
// hand-maintained, so the library grows without touching any page code.
import { readdir, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { PDFDocument } from "pdf-lib";

const SRC = "/Users/jake/Documents/Scans-Monsters-Work/print";
const PUB = new URL("../public/monsters/", import.meta.url).pathname;
const DATA = new URL("../src/data/", import.meta.url).pathname;

const DPI = 300;
// Printers cannot reach the sheet edge, and a coloring page wants a little
// white to hold onto. 0.3in is inside every consumer printer's dead zone.
const MARGIN_IN = 0.3;
const PAGES = {
  letter: { w: 8.5, h: 11 },
  a4: { w: 8.27, h: 11.69 },
};
// The scans carry a wide, uneven white border. Trimming to the ink and then
// scaling to the page is what makes the monster arrive as large as the sheet
// allows, which is the whole point of a printable.
const TRIM_THRESHOLD = 40;
const WEB_HEIGHT = 1600;
const THUMB_WIDTH = 560;

for (const d of ["print", "pages", "thumbs"]) {
  await mkdir(path.join(PUB, d), { recursive: true });
}
await mkdir(DATA, { recursive: true });

const files = (await readdir(SRC)).filter((f) => /^monster_\d+\.png$/.test(f)).sort();
if (!files.length) throw new Error(`No monster_NNN.png scans found in ${SRC}`);

/** Place a trimmed monster on a page of the given size, as large as it fits. */
async function sheet(art, artW, artH, page) {
  const pageW = Math.round(page.w * DPI);
  const pageH = Math.round(page.h * DPI);
  const inset = Math.round(MARGIN_IN * DPI);
  const boxW = pageW - inset * 2;
  const boxH = pageH - inset * 2;
  // Fit, never fill. Filling would crop a limb off, and these drawings run to
  // the edge of their own bounding box.
  const scale = Math.min(boxW / artW, boxH / artH);
  const w = Math.round(artW * scale);
  const h = Math.round(artH * scale);
  const resized = await sharp(art).resize(w, h).toBuffer();
  // Threshold *after* the resize, not before. Scaling interpolates, which turns
  // clean two-tone line art back into a field of grey edge pixels: a 40kB sheet
  // becomes 540kB, and a 300dpi printer only halftones that grey back into
  // dots anyway. Two colours is both smaller and the better print.
  return sharp({
    create: { width: pageW, height: pageH, channels: 3, background: "#ffffff" },
  })
    .composite([{ input: resized, left: Math.round((pageW - w) / 2), top: Math.round((pageH - h) / 2) }])
    .grayscale()
    .threshold(128)
    .png({ compressionLevel: 9, palette: true, colors: 2 })
    .toBuffer();
}

/** Wrap a full-page raster as a PDF page of exactly that physical size. */
async function toPdf(pngBuffer, page) {
  const doc = await PDFDocument.create();
  doc.setTitle("A monster to color");
  doc.setCreator("jakeherridge.com");
  const img = await doc.embedPng(pngBuffer);
  // PDF units are points, 72 per inch. Setting the page in points and drawing
  // the image across all of it is what pins the physical size and orientation,
  // so it prints the same everywhere instead of at the browser's whim.
  const pw = page.w * 72;
  const ph = page.h * 72;
  const p = doc.addPage([pw, ph]);
  p.drawImage(img, { x: 0, y: 0, width: pw, height: ph });
  return Buffer.from(await doc.save());
}

const manifest = [];
let n = 0;

for (const f of files) {
  n++;
  const id = String(n).padStart(2, "0");
  const src = path.join(SRC, f);

  // Trim to the ink. Threshold first so the trim keys off real line work
  // rather than scanner speckle.
  const trimmed = await sharp(src)
    .grayscale()
    .threshold(TRIM_THRESHOLD)
    .trim({ threshold: 10 })
    .toBuffer({ resolveWithObject: true });
  const art = trimmed.data;
  const { width: artW, height: artH } = trimmed.info;

  // Print sheets.
  const letterPng = await sheet(art, artW, artH, PAGES.letter);
  const a4Png = await sheet(art, artW, artH, PAGES.a4);
  await writeFile(path.join(PUB, "print", `${id}-letter.pdf`), await toPdf(letterPng, PAGES.letter));
  await writeFile(path.join(PUB, "print", `${id}-a4.pdf`), await toPdf(a4Png, PAGES.a4));

  // The PNG twin, for anyone who would rather have an image than a PDF. Same
  // Letter geometry, and the density tag tells image viewers and print dialogs
  // it is a 300dpi page rather than a very large screen image.
  await sharp(letterPng)
    .withMetadata({ density: DPI })
    .png({ compressionLevel: 9, palette: true, colors: 2 })
    .toFile(path.join(PUB, "print", `${id}.png`));

  // Web assets. The coloring canvas needs the full scan frame, not the trim,
  // because its border flood assumes paper all the way around the edge.
  await sharp(src)
    .resize({ height: WEB_HEIGHT })
    .grayscale()
    .png({ compressionLevel: 9, palette: true, colors: 16 })
    .toFile(path.join(PUB, "pages", `${id}.png`));

  await sharp(art)
    .resize({ width: THUMB_WIDTH, fit: "inside" })
    .flatten({ background: "#ffffff" })
    .webp({ quality: 88 })
    .toFile(path.join(PUB, "thumbs", `${id}.webp`));

  manifest.push({
    id,
    number: n,
    // Titles are Jake's to write. Until then a monster is its number, which is
    // honest and reads fine in a catalog.
    title: `Monster ${id}`,
    aspect: Number((artW / artH).toFixed(4)),
  });
  process.stdout.write(`  ${id}  ${artW}x${artH} ink\n`);
}

await writeFile(path.join(DATA, "monsters.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`\n${n} monsters -> print sheets, web pages, thumbs, and src/data/monsters.json`);
