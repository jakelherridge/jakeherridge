// The sticker wall. Every exhibit is a die-cut sticker on the home page;
// stickers come from scripts/stickers-build.mjs, never hand-edited.
import type { ImageMetadata } from "astro";
import gatorsSticker from "../assets/stickers/gators.png";
import monstersSticker from "../assets/stickers/monsters.png";
import pocketwildSticker from "../assets/stickers/pocketwild.png";
import swordSticker from "../assets/stickers/sword.png";
import synapseSticker from "../assets/stickers/synapse.png";
import kitchenSticker from "../assets/stickers/kitchen.png";
import perspectiveSticker from "../assets/stickers/perspective.png";

export interface Exhibit {
  href: string;
  title: string;
  line: string;
  sticker: ImageMetadata;
  alt: string;
  external?: boolean;
}

// Wall order is Jake's call (2026-07-31): synapse, monsters, pocketwild,
// gators, kitchen, sword.
export const exhibits: Exhibit[] = [
  {
    href: "/exhibits/synapse/",
    title: "Synapse",
    line: "Instantly connects all of your files for AI context.",
    sticker: synapseSticker,
    alt: "Sticker of a coral-pink brain drawn as a network of connected nodes",
  },
  {
    href: "/exhibits/monsters/",
    title: "Monster Sketches",
    line: "Print them as coloring sheets for your kids.",
    sticker: monstersSticker,
    alt: "Sticker of a blue four-eyed monster with gold tusks",
  },
  {
    href: "/exhibits/pocketwild/",
    title: "PocketWild",
    line: "Notice and name the real world.",
    sticker: pocketwildSticker,
    alt: "Sticker of an iPhone running PocketWild's home screen",
  },
  {
    href: "/exhibits/gators/",
    title: "Glitchy Gator Machine",
    line: "A fun little NFT project that taught me blockchain and patience.",
    sticker: gatorsSticker,
    alt: "Sticker of a purple gator with horns and a glitching rainbow laser eye",
  },
  {
    href: "https://kitchenhappy.club/",
    title: "Kitchen Happy Club",
    line: "Recipes and a journey. My wife's kitchen.",
    sticker: kitchenSticker,
    alt: "Haley in her kitchen, with photos of her recipes stickered over the picture",
    external: true,
  },
  {
    href: "/exhibits/sword/",
    title: "The Boy and the Sword",
    line: "A short story.",
    sticker: swordSticker,
    alt: "Sticker of an ink-drawn sword",
  },
  {
    href: "/exhibits/from-where-you-stand/",
    title: "From Where You Stand",
    line: "Every view is true. None is complete.",
    sticker: perspectiveSticker,
    alt: "Sticker of an ink cylinder casting a circle shadow on the floor and a square shadow on the wall",
  },
];
