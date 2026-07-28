// Remove the flat machine background from the gator header: flood from
// the image borders across near-uniform color, set those pixels
// transparent. Outputs a transparent header PNG and a paper-toned poster.
import sharp from "sharp";

const SRC = new URL("../src/assets/gators/gator-header-original.png", import.meta.url).pathname;
const HEADER = new URL("../src/assets/gators/gator-header.png", import.meta.url).pathname;
const POSTER = new URL("../src/assets/gators/gator-poster.png", import.meta.url).pathname;

const { data, info } = await sharp(SRC).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H } = info;
const n = W * H;

// Background reference: the top-left pixel.
const bg = [data[0], data[1], data[2]];
const isBg = (p) => {
  const i = p * 4;
  const dr = data[i] - bg[0];
  const dg = data[i + 1] - bg[1];
  const db = data[i + 2] - bg[2];
  return dr * dr + dg * dg + db * db < 3200;
};

const mask = new Uint8Array(n);
const queue = new Int32Array(n);
let qh = 0,
  qt = 0;
const push = (p) => {
  if (!mask[p] && isBg(p)) {
    mask[p] = 1;
    queue[qt++] = p;
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
  const p = queue[qh++];
  const x = p % W;
  if (x > 0) push(p - 1);
  if (x < W - 1) push(p + 1);
  if (p >= W) push(p - W);
  if (p < n - W) push(p + W);
}
let cleared = 0;
for (let p = 0; p < n; p++) {
  if (mask[p]) {
    data[p * 4 + 3] = 0;
    cleared++;
  }
}
await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toFile(HEADER);
console.log(`Header: background cleared (${Math.round((cleared / n) * 100)}% of pixels)`);

// Poster: transparent gator over the paper tone, 4:3.
const trans = await sharp(HEADER).extract({ left: 0, top: 40, width: W, height: Math.round(W * 0.75) }).toBuffer();
await sharp({
  create: { width: W, height: Math.round(W * 0.75), channels: 4, background: "#f4f1e9" },
})
  .composite([{ input: trans }])
  .flatten({ background: "#f4f1e9" })
  .resize(900, 675)
  .png()
  .toFile(POSTER);
console.log("Poster: gator on paper");
