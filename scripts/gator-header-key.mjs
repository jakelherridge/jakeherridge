// Key the flat machine background off the gator header.
//
// This is a GLOBAL colour key, not a border flood: the background colour
// also appears in enclosed pockets (between teeth, inside the horn ring,
// in the gaps of the tentacles) and those have to go too. Pixels close to
// the sampled corner colour go fully transparent; pixels in a narrow band
// beyond it get partial alpha so the cut edge stays soft instead of
// jagged. A safety check reports how much of the art the key touched.
import sharp from "sharp";

const SRC = new URL("../src/assets/gators/gator-header-original.png", import.meta.url).pathname;
const HEADER = new URL("../src/assets/gators/gator-header.png", import.meta.url).pathname;
const POSTER = new URL("../src/assets/gators/gator-poster.png", import.meta.url).pathname;
const PROOF = new URL("../src/assets/gators/.key-proof.png", import.meta.url).pathname;

const HARD = 2600; // squared distance: fully transparent
const SOFT = 9000; // squared distance: feathered edge

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const bg = [data[0], data[1], data[2]];

let cleared = 0;
let feathered = 0;
for (let p = 0; p < W * H; p++) {
  const i = p * 4;
  const dr = data[i] - bg[0];
  const dg = data[i + 1] - bg[1];
  const db = data[i + 2] - bg[2];
  const d2 = dr * dr + dg * dg + db * db;
  if (d2 <= HARD) {
    data[i + 3] = 0;
    cleared++;
  } else if (d2 < SOFT) {
    // Ramp alpha across the band so edges do not stair-step.
    const t = (d2 - HARD) / (SOFT - HARD);
    data[i + 3] = Math.round(data[i + 3] * t);
    feathered++;
  }
}

await sharp(data, { raw: { width: W, height: H, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(HEADER);

const pct = (n) => ((n / (W * H)) * 100).toFixed(1) + "%";
console.log(`Keyed rgb(${bg.join(",")}): ${pct(cleared)} cleared, ${pct(feathered)} feathered`);

// Proof sheet: the cut-out over magenta, so any hole punched through the
// art is obvious at a glance.
await sharp({ create: { width: W, height: H, channels: 4, background: "#ff00ff" } })
  .composite([{ input: HEADER }])
  .png()
  .toFile(PROOF);

// Poster: the gator on the site's paper, 4:3.
const posterH = Math.round(W * 0.75);
const top = Math.round((H - posterH) * 0.3);
const crop = await sharp(HEADER).extract({ left: 0, top, width: W, height: posterH }).toBuffer();
await sharp({ create: { width: W, height: posterH, channels: 4, background: "#f4f1e9" } })
  .composite([{ input: crop }])
  .flatten({ background: "#f4f1e9" })
  .resize(900, 675)
  .png()
  .toFile(POSTER);
console.log("Poster: gator on paper");
console.log("Proof sheet (magenta backing): src/assets/gators/.key-proof.png");
