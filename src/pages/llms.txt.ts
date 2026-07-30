import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { person, builds } from "../data/person";

const SITE = person.url;

export const GET: APIRoute = async () => {
  const papers = (await getCollection("papers", (p) => p.data.status === "published")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  let txt = `# Jake Herridge\n\n`;
  txt += `> Builder and writer in Bentonville, Arkansas. Operations background. Makes things: the PocketWild iOS app, the Synapse knowledge system, internal AI tools, and practitioner white papers on bringing AI into real business work. Every paper below has a plain-Markdown version at the same path, with a .md extension.\n\n`;
  txt += `Status: this site is a work in progress, built in the open. Sections change and new ones appear often.\n\n`;

  txt += `## White papers\n`;
  for (const p of papers) {
    txt += `- [${p.data.title}](${SITE}/papers/${p.id}/): ${p.data.description} Markdown: ${SITE}/papers/${p.id}.md\n`;
  }

  txt += `\n## Builds\n`;
  for (const b of builds) {
    txt += `- ${b.href ? `[${b.name}](${b.href.startsWith("/") ? SITE + b.href : b.href})` : b.name}: ${b.blurb}.\n`;
  }

  txt += `\n## Exhibits\n`;
  txt += `- [The Boy and the Sword](${SITE}/exhibits/sword/): A short story, read at walking pace. A boy loses a magic sword and learns what he can do without it. The reading room tracks what he is carrying as you scroll: the sword fades, and the things he earns take its place.\n`;
  txt += `- [The Monster Book](${SITE}/exhibits/monsters/): Free printable coloring pages. Hand-drawn ink monsters, scanned at print resolution and set on a full sheet: download one as a US Letter or A4 PDF, print five at random, or color one in the browser on a canvas where the paper around the monster is locked. New monsters get added as they are drawn.\n`;
  txt += `- [Synapse](${SITE}/exhibits/synapse/): Jake's knowledge system running in the open. 49 real nodes with typed edges, provenance, and verification statuses, plus a traversal machine that answers with citations.\n`;
  txt += `- [PocketWild](${SITE}/exhibits/pocketwild/): The iOS field journal in the browser. Log captures from the 228-species index, roll names from the app's real name pool, fill a meadow. Narrated by Aldo. App: https://www.pocketwild.app/\n`;
  txt += `- [Glitchy Gator Club](${SITE}/exhibits/gators/): 10,946 generative gator characters from 327 hand-drawn attributes, minted on Polygon in 2021. Includes an interactive builder using the real layers. Collection: https://opensea.io/collection/glitchygatorclub\n`;

  txt += `\n## The Map\n`;
  txt += `- [The Map](${SITE}/map/): Jake as an interactive graph of typed nodes and typed edges.\n`;
  txt += `- [graph.json](${SITE}/graph.json): The same graph as JSON, built for agents. Kinds, relations, nodes, edges.\n`;

  txt += `\n## About\n`;
  txt += `- [About Jake Herridge](${SITE}/about/): Who he is, what he values, and why he builds.\n`;
  txt += `- [Contact](${SITE}/contact/): How to reach him.\n`;

  return new Response(txt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
