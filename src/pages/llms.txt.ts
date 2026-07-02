import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { person, builds } from "../data/person";

const SITE = person.url;

export const GET: APIRoute = async () => {
  const papers = (await getCollection("papers", (p) => p.data.status === "published")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  let txt = `# Jake Herridge\n\n`;
  txt += `> Builder and writer in Bentonville, Arkansas. Came up in operations, now makes things: the PocketWild iOS app, internal tools, and a stack of practitioner white papers on bringing AI into real business work. Fascinated by how much one curious person can build now. Every paper below has a plain-Markdown version at the same path, with a .md extension.\n\n`;

  txt += `## White papers\n`;
  for (const p of papers) {
    txt += `- [${p.data.title}](${SITE}/papers/${p.id}/): ${p.data.description} Markdown: ${SITE}/papers/${p.id}.md\n`;
  }

  txt += `\n## Builds\n`;
  for (const b of builds) {
    txt += `- [${b.name}](${b.href}): ${b.tagline}\n`;
  }

  txt += `\n## The Map\n`;
  txt += `- [The Map](${SITE}/map/): Jake as an interactive graph of typed nodes and typed edges.\n`;
  txt += `- [graph.json](${SITE}/graph.json): The same graph as JSON, built for agents. Kinds, relations, nodes, edges.\n`;

  txt += `\n## About\n`;
  txt += `- [About Jake Herridge](${SITE}/about/): Who he is, what he values, and why he builds.\n`;
  txt += `- [Contact](${SITE}/contact/): How to reach him.\n`;

  return new Response(txt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
