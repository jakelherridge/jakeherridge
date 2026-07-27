// The gator wall: eleven characters Jake curated from the 10,946.
// Images recovered from the old Creator Vault gallery.

import type { ImageMetadata } from "astro";
import g01 from "../assets/gators/gator-01.jpg";
import g02 from "../assets/gators/gator-02.jpg";
import g03 from "../assets/gators/gator-03.jpg";
import g04 from "../assets/gators/gator-04.jpg";
import g05 from "../assets/gators/gator-05.jpg";
import g06 from "../assets/gators/gator-06.jpg";
import g07 from "../assets/gators/gator-07.jpg";
import g09 from "../assets/gators/gator-09.jpg";
import g10 from "../assets/gators/gator-10.jpg";
import g11 from "../assets/gators/gator-11.jpg";
import g12 from "../assets/gators/gator-12.jpg";

export interface Gator {
  image: ImageMetadata;
  alt: string;
  big?: boolean; // takes a 2x2 cell on the wall
}

export const gators: Gator[] = [
  {
    image: g10,
    alt: "A pink gator with seven glitching rainbow eyes, gold horns, and human hands, on green",
    big: true,
  },
  {
    image: g02,
    alt: "A teal gator with periscope eyes and a storm cloud with lightning bolts on its head, on orange",
  },
  {
    image: g05,
    alt: "An orange gator in a gray beanie with a camera-lens eye and a huge grin, on green",
  },
  {
    image: g07,
    alt: "A tiger-striped brown gator with silver dome eyes and a happy green frog sitting on its head, on purple",
    big: true,
  },
  {
    image: g03,
    alt: "A red gator with a glitching rainbow grin and leafy branch arms, on mustard yellow",
  },
  {
    image: g06,
    alt: "An orange gator with four spider eyes, slicked black hair, and boxing gloves, on purple",
  },
  {
    image: g12,
    alt: "A green gator with a backwards visor, a cigar, a stack of pancakes for a hat, and hearts floating by, on green",
  },
  {
    image: g09,
    alt: "A blue gator with a glowing glitched orb for a face, gray spikes, and a body melting into pink drips, on teal",
  },
  {
    image: g01,
    alt: "A green gator with silver dome caps and tentacle arms, on purple",
  },
  {
    image: g11,
    alt: "A green gator with a black void eye, pink crest spikes, skeleton-hand arms, and its tongue out, on orange",
  },
  {
    image: g04,
    alt: "A blue and purple gator in a backwards visor holding a red staff, on green",
  },
];
