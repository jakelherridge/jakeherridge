// The art shelf: things made for the joy of making.
// Images recovered from the old Creator Vault.

import type { ImageMetadata } from "astro";
import gators from "../assets/creative/gators.jpg";
import keycaps from "../assets/creative/keycaps.jpg";
import eagleSword from "../assets/creative/eagle-sword.jpg";

export interface ArtPiece {
  id: string;
  name: string;
  category: string;
  blurb: string;
  image: ImageMetadata;
  alt: string;
}

export const art: ArtPiece[] = [
  {
    id: "gators",
    name: "Glitchy Gators",
    category: "Generative art",
    blurb:
      "Ten thousand gators, no two alike, generated from more than three hundred attributes I drew by hand. An early experiment in building a system that makes things.",
    image: gators,
    alt: "A grinning green gator holding a crystal-tipped staff, on a hot pink background",
  },
  {
    id: "keycaps",
    name: "Tiny Keycaps",
    category: "Sculpture",
    blurb:
      "Keycaps sculpted, molded, and cast in resin. Tiny faces for a keyboard. Making something with your hands scratches a different itch.",
    image: keycaps,
    alt: "A grid of small hand-sculpted resin keycaps in bright colors",
  },
  {
    id: "eagle-sword",
    name: "Ornate Eagle Sword",
    category: "Sketch",
    blurb:
      "A pencil sketch of a sword guarded by two eagles, borrowing from American and Japanese design at once. Drawn for no reason except wanting to see it.",
    image: eagleSword,
    alt: "A pencil sketch of an ornate sword with two eagle heads forming the guard",
  },
];
