// The Collection: things Jake has made, shipped and shelved.
// Derived from the identity data in person.ts so the two never drift.

import { builds } from "./person";

export type SpecimenStatus = "shipped" | "shelved" | "growing";

export interface Specimen {
  id: string; // anchor on /collection/
  no: string; // specimen number, zero padded
  name: string;
  category: string;
  year?: string;
  note?: string; // extra metadata shown after the category
  status: SpecimenStatus;
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
  body: b.body,
  href: b.href,
  linkLabel: b.linkLabel,
}));

export interface ShelvedSpecimen {
  no: string;
  title: string;
  body: string;
}

// Projects built far enough to test, then stopped. Described, not moralized.
const shelvedProjects = [
  {
    title: "A 3D image generator app",
    body: "An app that generated 3D-effect images from flat photos. The demo worked. It never found a real use, so I stopped.",
  },
  {
    title: "A color-palette and wardrobe tool",
    body: "A tool that matched clothing colors to a personal palette and organized a wardrobe around it. I built it for myself and stopped there.",
  },
  {
    title: "An occupation-code and wage-level generator",
    body: "A tool that generated occupation codes and prevailing wage levels for job postings. The public wage data was too thin to rely on, so I shelved it.",
  },
];

export const shelved: ShelvedSpecimen[] = shelvedProjects.map((e, i) => ({
  no: String(specimens.length + i + 1).padStart(3, "0"),
  title: e.title,
  body: e.body,
}));
