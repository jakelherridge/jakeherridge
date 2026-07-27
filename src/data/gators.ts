// The gator wall: Jake's 37 favorite characters from the 10,946, full-frame
// squares processed from the original art, each linking to its token on
// OpenSea. Two heroes take the big tiles.

import type { ImageMetadata } from "astro";

const CONTRACT = "0x0439353311bff2f647141f124822cc908bb90e2c";
const BIG = new Set([12, 3064]);

const modules = import.meta.glob<{ default: ImageMetadata }>("../assets/gators-wall/*.webp", {
  eager: true,
});

export interface WallGator {
  token: number;
  image: ImageMetadata;
  href: string;
  big: boolean;
}

export const wall: WallGator[] = Object.entries(modules)
  .map(([file, mod]) => {
    const token = parseInt(file.split("/").pop()!.replace(".webp", ""), 10);
    return {
      token,
      image: mod.default,
      href: `https://opensea.io/item/polygon/${CONTRACT}/${token}`,
      big: BIG.has(token),
    };
  })
  .sort((a, b) => a.token - b.token);
