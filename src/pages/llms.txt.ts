import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { person, builds } from "../data/person";

const SITE = person.url;

export const GET: APIRoute = async () => {
  const papers = (await getCollection("papers", (p) => p.data.status === "published")).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  let txt = `# Jake Herridge\n\n`;
  txt += `> Builder and writer in Bentonville, Arkansas. Operations background. Makes things: the PocketWild iOS app, generative art, monster coloring sheets, stories, and practitioner white papers on bringing AI into real business work. The site is a small set of exhibit rooms plus a map that connects everything. Every paper below has a plain-Markdown version at the same path, with a .md extension.\n\n`;

  txt += `## Exhibits\n`;
  txt += `- [Glitchy Gator Machine](${SITE}/exhibits/gators/): A fun little NFT project that taught Jake blockchain and patience. 10,946 generative gator characters from 327 hand-drawn attributes, minted on Polygon in 2021. One big red button mints a gator from the real layers with the real rarity weights. Collection: https://opensea.io/collection/glitchygatorclub\n`;
  txt += `- [Monster Sketches](${SITE}/exhibits/monsters/): Hand-drawn ink monsters as free printable coloring sheets for kids. Download one as a US Letter or A4 PDF, print five at random, or color one in the browser. New monsters get added as they are drawn.\n`;
  txt += `- [PocketWild](${SITE}/exhibits/pocketwild/): Notice and name the real world. The iOS field journal in the browser: log captures from the 228-species index, roll names from the app's real name pool, fill a meadow. App: https://www.pocketwild.app/\n`;
  txt += `- [The Boy and the Sword](${SITE}/exhibits/sword/): A short story, read at walking pace. The reading room tracks what the boy is carrying as you scroll.\n`;
  txt += `- [Synapse](${SITE}/exhibits/synapse/): Jake's second brain, hooked up for reading. Synapse is a Claude Code plugin (https://github.com/jakelherridge/synapse-capture) that types, tags, and connects a folder of notes on its own. The room shows the whole vault as an anonymous turning 3D graph, replays how real nodes were captured, and answers questions about this site with citations from real nodes.\n`;
  txt += `- [Kitchen Happy Club](https://kitchenhappy.club/): Recipes and a journey. Jake's wife Haley's kitchen, on its own site.\n`;

  txt += `\n## White papers\n`;
  for (const p of papers) {
    txt += `- [${p.data.title}](${SITE}/papers/${p.id}/): ${p.data.description} Markdown: ${SITE}/papers/${p.id}.md\n`;
  }

  txt += `\n## Builds\n`;
  for (const b of builds) {
    txt += `- ${b.href ? `[${b.name}](${b.href.startsWith("/") ? SITE + b.href : b.href})` : b.name}: ${b.blurb}.\n`;
  }

  txt += `\n## The Map\n`;
  txt += `- [The Map](${SITE}/map/): Jake as an interactive graph of typed nodes and typed edges.\n`;
  txt += `- [graph.json](${SITE}/graph.json): The same graph as JSON, built for agents. Kinds, relations, nodes, edges.\n`;

  txt += `\n## Contact\n`;
  txt += `- Email: jakelherridge@gmail.com. Also on LinkedIn (jake-herridge-2722b139) and GitHub (jakelherridge).\n`;

  return new Response(txt, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
};
