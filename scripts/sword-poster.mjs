// Poster for the sword exhibit: the magic sword faded to a dashed ghost,
// the things the boy actually earned drawn in solid ink, on paper.
import sharp from "sharp";

const INK = "#1b1a17";
const PINE = "#1f6b54";
const PAPER = "#f4f1e9";

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="675">
  <rect width="900" height="675" fill="${PAPER}"/>
  <defs>
    <filter id="w">
      <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="5" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="3"/>
    </filter>
  </defs>
  <g filter="url(#w)" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round">
    <g stroke="${PINE}" opacity="0.3" stroke-dasharray="11 10">
      <path d="M250 96 L282 128 L112 384 L68 404 L84 356 Z"/>
      <path d="M58 372 L102 416"/>
      <path d="M80 424 L48 456"/>
      <path d="M40 404 L72 436"/>
    </g>
    <path d="M300 505C375 445 450 350 512 258"/>
    <path d="M512 258 L560 212"/>
    <path d="M512 258 L544 292"/>
    <path d="M432 345 L480 328"/>
    <g transform="translate(560,380) scale(2.6)" stroke-width="1.9">
      <path d="M10 32c8-11 26-13 36-3 3 3 5 3 5 3s-2 0-5 3c-10 10-28 8-36-3Z"/>
      <path d="M51 32 L60 25 L58 32 L60 39 Z"/>
      <circle cx="20" cy="30" r="2" fill="${INK}"/>
      <path d="M28 24c3 4 3 12 0 16" opacity="0.55"/>
    </g>
    <g transform="translate(88,432) scale(2.9)" stroke-width="1.7">
      <path d="M8 40 L44 30"/>
      <path d="M10 47 L46 37"/>
      <ellipse cx="45" cy="30.5" rx="3.5" ry="5" transform="rotate(-15 45 30.5)"/>
      <ellipse cx="47" cy="37.5" rx="3.5" ry="5" transform="rotate(-15 47 37.5)"/>
      <path d="M8 40 L10 47"/>
      <path d="M18 22 L26 44" opacity="0.5"/>
    </g>
    <g transform="translate(590,86) scale(2.6)" stroke-width="1.9">
      <path d="M16 40c-5-3-3-11 3-13 2-7 11-9 16-5 6-2 12 3 11 9 4 3 3 10-3 11-6 4-22 3-27-2Z"/>
      <circle cx="30" cy="33" r="6.5"/>
    </g>
  </g>
</svg>`;

await sharp(Buffer.from(svg))
  .png()
  .toFile(new URL("../src/assets/sword-poster.png", import.meta.url).pathname);
console.log("Poster -> src/assets/sword-poster.png");
