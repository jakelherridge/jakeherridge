import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const papers = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/papers" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string(),
    status: z.enum(["draft", "published"]).default("draft"),
    updated: z.coerce.date().optional(),
    paperNumber: z.number().optional(),
  }),
});

export const collections = { papers };
