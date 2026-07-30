// The exhibit rooms, in opening order. Drives /exhibits/ and the home wall.
import type { ImageMetadata } from "astro";
import gatorPoster from "../assets/gators/gator-poster.png";
import pocketwildPoster from "../assets/pocketwild-poster.png";
import synapsePoster from "../assets/synapse-poster.png";
import monstersPoster from "../assets/monsters-poster.png";
import swordPoster from "../assets/sword-poster.png";

export interface Exhibit {
  href: string;
  title: string;
  label: string;
  line: string;
  image: ImageMetadata;
  alt: string;
  pixelated?: boolean;
}

export const exhibits: Exhibit[] = [
  {
    href: "/exhibits/sword/",
    title: "The Boy and the Sword",
    label: "Now open · A story",
    line: "A boy loses a magic sword. Read it at walking pace and watch what he is carrying change.",
    image: swordPoster,
    alt: "An ink sketch: a faded sword, a stick, a fish, a fried egg, and firewood",
  },
  {
    href: "/exhibits/monsters/",
    title: "The Monster Book",
    label: "Now open · Coloring pages",
    line: "Hand-drawn ink monsters, free to print. Black on white, sized to a full sheet, Letter or A4. Or color one in the browser.",
    image: monstersPoster,
    alt: "A colored page from the book: a blue four-eyed monster with gold tusks",
  },
  {
    href: "/exhibits/synapse/",
    title: "Synapse",
    label: "Now open · Knowledge system",
    line: "49 real nodes with typed edges and verification statuses, and a machine that walks the graph and answers with citations.",
    image: synapsePoster,
    alt: "A diagram of typed nodes connected by different edge styles",
  },
  {
    href: "/exhibits/pocketwild/",
    title: "PocketWild",
    label: "Now open · iOS app",
    line: "The field journal in the browser: log captures, name them from the app's real name pool, fill your meadow. Aldo narrates.",
    image: pocketwildPoster,
    alt: "A grid of nine pixel-art creatures from the PocketWild index",
    pixelated: true,
  },
  {
    href: "/exhibits/gators/",
    title: "Glitchy Gator Club",
    label: "Generative art · 2021",
    line: "10,946 characters from 327 hand-drawn attributes, minted on Polygon. Build your own from the real layers.",
    image: gatorPoster,
    alt: "A gator built in the machine, on paper: purple, horned, with a glitching laser eye",
  },
];
