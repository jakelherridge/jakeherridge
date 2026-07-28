// The exhibit rooms, in opening order. Drives /exhibits/ and the home wall.
import type { ImageMetadata } from "astro";
import gatorPoster from "../assets/gators/gator-10.jpg";
import pocketwildPoster from "../assets/pocketwild-poster.png";
import synapsePoster from "../assets/synapse-poster.png";
import monstersPoster from "../assets/monsters-poster.png";

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
    href: "/exhibits/monsters/",
    title: "The Monster Book",
    label: "Now open · Coloring book",
    line: "16 hand-drawn ink monsters as a notebook you can flip through and color. The paper is locked; the monsters are not.",
    image: monstersPoster,
    alt: "A hand-drawn ink monster on warm paper",
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
    line: "10,946 characters from 300+ hand-drawn attributes, minted on Polygon. Build your own from the real layers.",
    image: gatorPoster,
    alt: "A pink gator with seven glitching rainbow eyes and gold horns",
  },
];
