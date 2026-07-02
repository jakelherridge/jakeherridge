// The Collection: every specimen worth showing, shipped or shelved.
// Derived from the identity data in person.ts so the two never drift.

import { builds, lab } from "./person";

export type SpecimenStatus = "shipped" | "shelved" | "growing";

export interface Specimen {
  id: string; // anchor on /collection/
  no: string; // specimen number, zero padded
  name: string;
  category: string;
  year?: string;
  note?: string; // extra metadata shown after the category
  status: SpecimenStatus;
  tagline: string;
  body: string;
  href?: string;
  linkLabel?: string;
}

const slug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const ids: Record<string, string> = {
  PocketWild: "pocketwild",
  Synapse: "synapse",
  "Synapse Capture": "synapse-capture",
  "APD Storytelling System": "apd",
  "Kitchen Happy": "kitchen-happy",
  "Making Moves PT": "making-moves",
};

const years: Record<string, string> = {
  PocketWild: "2026",
  Synapse: "2026",
  "Synapse Capture": "2026",
  "APD Storytelling System": "2026",
};

export const specimens: Specimen[] = builds.map((b, i) => ({
  id: ids[b.name] ?? slug(b.name),
  no: String(i + 1).padStart(3, "0"),
  name: b.name,
  category: b.category,
  year: years[b.name],
  note: b.name === "PocketWild" ? "once known as Entry No. 138" : undefined,
  status: b.name === "Synapse" ? "growing" : "shipped",
  tagline: b.tagline,
  body: b.body,
  href: b.href,
  linkLabel: b.linkLabel,
}));

export interface ShelvedSpecimen {
  no: string;
  title: string;
  lesson: string;
}

export const shelved: ShelvedSpecimen[] = lab
  .filter((e) => e.outcome === "shelved")
  .map((e, i) => ({
    no: String(specimens.length + i + 1).padStart(3, "0"),
    title: e.title,
    lesson: e.lesson,
  }));
