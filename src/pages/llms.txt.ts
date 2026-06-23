import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { person, builds } from "../data/person";

const SITE = person.url;

export const GET: APIRoute = async () => {
  const papers = (await getCollection("papers", (p) => p.data.status === "published")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  let txt = `# Jake Herridge\n\n`;
  txt += `> Operations leader and AI builder in Bentonville, Arkansas. Spent ten years scaling an engineering staffing firm from $22M to $75M and 180 to 550+ engineers with internal headcount flat, then became its AI champion. Writes practitioner white papers on bringing AI into real business work, and ships products like the PocketWild iOS app. Every paper below has a plain-Markdown version at the same path with a .md extension.\n\n`;

  txt += `## White papers\n`;
  for (const p of papers) {
    txt += `- [${p.data.title}](${SITE}/papers/${p.id}/): ${p.data.description} Markdown: ${SITE}/papers/${p.id}.md\n`;
  }

  txt += `\n## Builds\n`;
  for (const b of builds) {
    txt += `- [${b.name}](${b.href}): ${b.tagline}\n`;
  }

  txt += `\n## About\n`;
  txt += `- [About Jake Herridge](${SITE}/about/): Background, the LER TechForce decade, the AI-champion work, and how he works.\n`;
  txt += `- [Contact](${SITE}/contact/): How to reach him.\n`;

  return new Response(txt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
