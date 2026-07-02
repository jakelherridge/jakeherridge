# Field-journal redesign (R-series)

**Date:** 2026-07-01 · **Branch:** feat/ai-profile-site-astro

## The brief

Jake: make the site more animated, creative, and clean; research last-30-day trends; understand
who he is from the Obsidian vault (Synapse) and turn that into the site. Keep it professional
but clearly not just another website.

## Decisions (locked with Jake)

1. **Big idea: field journal + graph.** The site mirrors PocketWild's structure. The Map is an
   interactive constellation of typed nodes and typed edges (his Synapse system made public);
   the Collection shows builds, flops, and art as numbered specimens with honest stamps;
   Writing holds papers plus a small stories shelf.
2. **Creative work: yes, professionally placed.** Gators, keycaps, eagle sword, The Boy and the
   Sword, A Fall Morning. Adds depth, never the center.
3. **Faith: not yet.** The faith essays and personal drafts stay offline until developed. Values
   appear as plain language (moments, presence, creation) without naming faith.
4. **Playfulness: delight + easter eggs.** Pixel frog on the footer ledge (homage to Aldo),
   heleks moments counter, a 404 that knows about the sword. No more than that.

## Trend research (June 2026), applied

- Anti-AI-slop analog direction validated: grain, editorial serifs, irregular grids, pixel
  accents, honest copy. Avoid: purple gradients, glassmorphism, bento-default, motion for
  motion's sake.
- Tech: CSS scroll-driven animations (`animation-timeline: view()`), cross-document View
  Transitions, `@starting-style`, variable-font display moments (Fraunces with WONK), all
  framework-free. Reduced motion respected everywhere.

## Units

- R1 foundation: Fraunces display, grain overlay, view transitions, stamp/pixel/motion
  utilities, new nav (Map / Collection / Writing / About / Contact), footer frog + moments.
- R2 the Map: `src/data/graph.ts` (36 nodes, 44 typed edges), hand-rolled force sim in
  `GraphMap.astro`, `/map/` page, `/graph.json` for agents, llms.txt entry.
- R3 the Collection: specimen cards (numbered, stamped SHIPPED / SHELVED / GROWING), internal
  work, shelved drawer with field notes, art shelf with recovered Creator Vault images.
  `/work/` and `/lab/` redirect here.
- R4 writing hub: papers first, stories shelf below. Story pages under `/stories/`.
- R5 home: kinetic Fraunces hero, embedded map, featured specimens, manifesto kept, desk list.
- R6 polish: about bookshelf (seven spines, one line each), 404 sword nod, ai.astro graph
  prompt, JSON-LD for stories.

## Notes

- Old Creator Vault images survive on Cloudinary; the artifact-to-URL mapping lives in the DB
  dump at `/Users/jake/Documents/Misc/database-dump-2026-06-21.sql` (artifacts table).
- PocketWild's original codename "Entry No. 138" appears in its specimen metadata on purpose.
- Voice rules hold for all new copy: plain, short sentences, no em or en dashes, no AI tells.
