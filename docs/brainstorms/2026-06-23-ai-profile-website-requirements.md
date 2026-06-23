---
date: 2026-06-23
topic: ai-profile-website
---

# AI-Optimized Profile Website — Requirements

## Summary

Replace the placeholder Eleventy site at jakeherridge.com with a from-scratch personal profile that positions Jake as an operations executive who actually ships AI. It leads with his three finished white papers as full readable pages, showcases his builds (PocketWild, the APD storytelling system, KitchenHappy) and a "Lab" of wins and honest flops, and is engineered to be machine-readable so AI answer engines cite him accurately. One low-friction path invites a reach-out.

---

## Problem Frame

Jake has a decade of operations leadership, a body of practitioner AI writing, shipped apps, and internal AI systems that saved thousands of hours. None of it has a home. The current site is a generic template with placeholder copy and a stock avatar. Anyone who hears about Jake and searches for him finds nothing that represents the work, and an AI assistant asked about him has nothing credible to cite. The cost is invisibility at the moment the work is most worth showing.

---

## Key Decisions

- **Positioning: an operator who ships AI, not a vendor who talks about it.** The spine is Jake's own line: find the big idea buried in the day-to-day, and use AI to take the boring work off people so they can do the interesting human work. Proof over claims.
- **Dual audience, one site.** Built to satisfy a hiring manager scanning for credibility and a peer reading for substance. The writing serves both without a tradeoff.
- **Machine-readability is a visible feature, not hidden SEO.** llms.txt, structured data, and a copy-paste "ask your AI about my work" prompt pack are part of the product surface, demonstrating the thesis rather than just implementing it.
- **Only finished papers ship.** The three polished papers go up as full pages. Unfinished work is neither shown nor teased, and the papers area is built so a new finished paper drops in without a redesign.
- **No job-search signal.** The site never states availability. Proof-of-work plus a neutral contact path carry the conversion. It reads as a durable home, not a job hunt.
- **Professional-only, for now.** Jake's personal essays and poems get no section. The voice stays "professional Jake" per VOICE.md.
- **Voice is binding.** All copy follows VOICE.md: plain, sincere, practitioner, short sentences, definitional anchors, no em dashes or en dashes.
- **The hero plays professional against candid.** Two real photos of Jake, one polished and one more candid, used creatively to carry "professional but fun" and the real-person feel. It echoes the professional and personal registers in VOICE.md.

---

## Actors

- A1. Human visitor. Primarily a hiring manager or recruiter assessing credibility, and a peer in the AI space reading for substance and sharing.
- A2. AI answer engine or agent. Crawls the site, reads llms.txt and structured data, and cites Jake's work when a user asks an assistant about him or his topics.

---

## Key Flows

- F1. Visitor to reach-out
  - **Trigger:** A visitor lands on the home page.
  - **Actors:** A1
  - **Steps:** Scans the positioning and the headline proof; moves to a paper, a build, or the Lab; lands on a clear, neutral contact path.
  - **Outcome:** The visitor reaches out via form, LinkedIn, or email, convinced Jake ships real AI work.
  - **Covered by:** R1, R5, R10, R15

- F2. AI citation
  - **Trigger:** An AI answer engine crawls jakeherridge.com, or a user asks an assistant about Jake.
  - **Actors:** A2
  - **Steps:** The agent reads semantic HTML, JSON-LD, and llms.txt, and resolves the finished papers as full-text pages on stable URLs.
  - **Outcome:** The assistant cites Jake's positioning and writing accurately, with correct titles and attribution.
  - **Covered by:** R5, R13

- F3. Ask-your-AI prompt pack
  - **Trigger:** A visitor wants to interrogate Jake's work with their own AI.
  - **Actors:** A1, A2
  - **Steps:** The visitor copies a provided prompt and the llms.txt URL into their assistant.
  - **Outcome:** Their assistant answers from the site's machine-readable content, turning the AI-readability into a visible, on-brand moment.
  - **Covered by:** R13, R14

---

## Requirements

**Content and structure**
- R1. The hero states Jake's positioning in his voice and surfaces the headline proof stat (LER TechForce scaled from $22M to $75M and 180 to 550+ engineers with internal headcount flat).
- R2. An About narrative tells Jake's story in VOICE.md voice: EE plus MBA, the LER TechForce decade, the AI-champion work, and the through-line. It names LER TechForce and Cummins and includes a light, tasteful human note (Bentonville, family) with no children's names.
- R3. The site is multi-page with stable, human-readable URLs per paper and per major section.
- R4. The old template's blog, "thought of the day," links model, and Netlify CMS admin are removed entirely.

**White papers**
- R5. The three finished papers (03 Compute, Then Narrate; 04 Abundance or Scarcity; 06 From Dashboards to Decisions) each render as a full reading page with its own URL.
- R6. Each finished paper offers a PDF download of the same content.
- R7. Paper 04's two SVG charts (breakeven, abundance curve) render with the paper.
- R8. No unfinished or draft paper is shown or teased anywhere on the site.
- R9. The papers index is built so a newly finished paper is added as a full page plus PDF without structural rework.

**Builds and Lab**
- R10. A Builds area features PocketWild (link), the APD storytelling system (GitHub link), and KitchenHappy (link, framed as helping Haley build her presence).
- R11. Jake's internal AI work (the AI Hub, the 2,000-hour-per-cycle performance-review system, Anthropic API tools, Claude Code automations) appears as described results, not demos or screenshots.
- R12. A Lab section owns wins and honest flops, each with its lesson, in Jake's voice (named flops include the 3D image generator, the color-palette/wardrobe tool, and the SOC-code/wage generator).

**AI-readability**
- R13. The site serves an llms.txt and emits structured data (JSON-LD: a Person for Jake, an Article per finished paper) plus clean semantic HTML and per-page metadata.
- R14. A visible "ask your AI about my work" moment provides a copy-paste prompt pack and points to the machine-readable endpoints, presented as an intentional feature.

**Contact**
- R15. The contact path offers a working form (host form handling only, no separate backend), a LinkedIn link, and an email button. The phone number never appears, and the email is rendered to resist trivial scraping.
- R16. Contact framing is neutral, an invitation to talk, with no availability or job-search language anywhere on the site.

**Voice, design, and delivery**
- R17. All copy follows VOICE.md, including the hard no-em-dash and no-en-dash rule.
- R18. The visual direction is editorial with playful accents: professional first, paper-forward, personality in the details.
- R19. The site deploys on the existing Netlify pipeline at jakeherridge.com, preserving the HTTPS and www-to-apex redirects.

---

## Acceptance Examples

- AE1. Adding a finished paper. **Covers R9.** **Given** the three finished papers are live, **when** Jake finishes a fourth, **then** it is added as a full page plus PDF and appears in the papers index with no redesign or structural change.
- AE2. AI crawl. **Covers R13.** **Given** an AI agent requests /llms.txt, **when** it follows the listed links, **then** it reaches full-text paper pages and a Person/Article structured-data graph that let it attribute Jake's work correctly.
- AE3. No availability signal. **Covers R16.** **Given** any page, **when** a reader looks for "open to work" or availability language, **then** none exists, only a neutral invitation to reach out.
- AE4. Voice check. **Covers R17.** **Given** any rendered copy, **when** it is scanned for em dashes or en dashes, **then** there are none.

---

## Success Criteria

- An AI assistant asked "who is Jake Herridge?" answers from the site with accurate positioning, correct paper titles, and proper attribution.
- A hiring manager grasps the operator-who-ships-AI story and the flat-headcount proof within the first screen.
- All copy reads as one voice and passes a VOICE.md check: a reader who knows Jake's writing recognizes it.
- A peer can read a full finished paper on the site and share a clean, stable URL.

---

## Scope Boundaries

**Deferred for later**
- Additional papers as each is finished; the other four are not on the site yet.
- A possible "Writing" corner for personal essays and poems.
- The CPG margin tool as a future Lab entry if Jake decides it belongs there.
- An interactive calculator widget for paper 04 (charts ship static for now).

**Outside this product's identity**
- Any job-search or availability signaling.
- The phone number, or any contact channel beyond form, LinkedIn, and email.
- Demos, screenshots, or source of internal or proprietary tools (described results only, per the public-or-synthetic-only ethic).
- A blog or frequently-updated content feed.

---

## Dependencies / Assumptions

- The Netlify deploy and the jakeherridge.com domain are kept; only the site contents are rebuilt.
- Finished-paper source drafts live in Jake's WhitePapers workspace (external to this repo) and are brought in as site content. "Finished" is exactly papers 03, 04, and 06 today.
- VOICE.md is the authority for all copy.
- Two photos from Jake for the hero, one professional and one more candid, to be played off each other creatively. Jake is providing both.
- The contact form relies on the host's form handling (for example Netlify Forms); no separate backend is assumed.

---

## Outstanding Questions

All blocking items are resolved. The following are intentionally deferred to planning.

**Deferred to planning**
- Static stack: stay on Eleventy, move to a different static generator, or hand-build. Decide against the AI-readability and paper-rendering needs.
- PDF generation approach for the finished papers.
- Exact information architecture and URL scheme.
- How paper markdown is ingested and kept in sync with the source drafts.

---

## Sources / Research

- VOICE.md — Jake's calibrated writing voice; the binding style reference.
- Jake's WhitePapers workspace (external to this repo) — the seven papers. Finished set: 03 Compute, Then Narrate; 04 Abundance or Scarcity (includes the breakeven and abundance-curve SVGs); 06 From Dashboards to Decisions.
- Resume facts — Director of Operations / Chief of Staff at LER TechForce (August 2019 to June 2026); EE and MBA from Harding; Anthropic AI Fluency certifications; the AI Hub and a 2,000-hour-per-cycle performance-review automation.
- Properties — PocketWild (https://www.pocketwild.app/), KitchenHappy (https://kitchenhappy.club/), APD storytelling system (https://github.com/jakelherridge/apd-storytelling-system), LinkedIn (https://www.linkedin.com/in/jake-herridge-2722b139).
- Existing site — Eleventy plus Netlify; `netlify.toml` holds the HTTPS and www-to-apex redirects to preserve; `.eleventy.js`, `src/` templates, and `admin/` (Netlify CMS) are the current structure being replaced.
