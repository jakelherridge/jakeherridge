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
      "A generative collection of ten thousand unique gators on Polygon, assembled from more than three hundred hand-drawn attributes: staffs, storm clouds, branches, glitch effects.",
    image: gators,
    alt: "A grinning green gator holding a crystal-tipped staff, on a hot pink background",
  },
  {
    id: "keycaps",
    name: "Tiny Keycaps",
    category: "Sculpture",
    blurb:
      "Keycaps sculpted by hand, then molded and cast in resin. Monsters, animals, and faces, each sized to fit a keyboard switch.",
    image: keycaps,
    alt: "A grid of small hand-sculpted resin keycaps in bright colors",
  },
  {
    id: "eagle-sword",
    name: "Ornate Eagle Sword",
    category: "Sketch",
    blurb:
      "A pencil sketch of a sword with two eagle heads forming the guard. American eagle imagery up top, a segmented pagoda-style grip below.",
    image: eagleSword,
    alt: "A pencil sketch of an ornate sword with two eagle heads forming the guard",
  },
];
