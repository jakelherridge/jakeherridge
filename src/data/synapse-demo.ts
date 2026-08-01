// The "ask it" demonstrations. Four questions a visitor to this site would
// actually ask, each answered by walking the exported nodes along their real
// typed edges. Traces are authored, but every hop names a real edge in
// /synapse/nodes.json and every citation opens a real node.
//
// The first demo is the default: it auto-runs once after boot so the room
// explains itself.

export interface TraceStep {
  op: string; // scan | match | open | hop | check | write
  text: string;
}

export interface Demo {
  id: string;
  q: string;
  key: string; // engraved on the plate under the knob
  steps: TraceStep[];
  answerHtml: string;
}

export const demos: Demo[] = [
  {
    id: "synapse",
    q: "What is Synapse, actually?",
    key: "SYNAPSE",
    steps: [
      { op: "scan", text: "index/_digest.md · 49 rows · summaries, kinds, edges" },
      { op: "match", text: "synapse — \"an AI-first knowledge graph of typed nodes\"" },
      { op: "open", text: "synapse (project · verified)" },
      { op: "hop", text: "derived_from → karpathy-obsidian-rag" },
      { op: "hop", text: "related_to → structure-not-embeddings" },
      { op: "hop", text: "part_of ← synapse-capture" },
      { op: "check", text: "statuses: verified · verified · verified" },
      { op: "write", text: "narrate over 4 nodes, cite each" },
    ],
    answerHtml: `Synapse is a Claude Code plugin and the graph it builds. Point it at a folder of notes and it breaks what it finds into small typed nodes, tags them, and connects them with typed edges, each node carrying its source and a verification status <cite data-n="synapse">synapse</cite>. The capture half runs at the end of a working session and files that session's decisions and findings on its own <cite data-n="synapse-capture">synapse-capture</cite>. There is no vector database: a deliberate structure plus an AI that can traverse it replaces the retrieval pipeline <cite data-n="structure-not-embeddings">structure-not-embeddings</cite>, a pattern that started in Andrej Karpathy's own vault <cite data-n="karpathy-obsidian-rag">karpathy-obsidian-rag</cite>. The plugin is public: <a href="https://github.com/jakelherridge/synapse-capture" rel="noopener">github.com/jakelherridge/synapse-capture</a>.`,
  },
  {
    id: "gators",
    q: "What is the Glitchy Gator Machine?",
    key: "GATORS",
    steps: [
      { op: "scan", text: "index/_digest.md · query: gators, nft, generative" },
      { op: "match", text: "glitchy-gator-club-nfts (source · verified)" },
      { op: "open", text: "glitchy-gator-club-nfts" },
      { op: "hop", text: "related_to → jake-herridge" },
      { op: "check", text: "provenance: portfolio artifacts table" },
      { op: "write", text: "narrate over 2 nodes, cite each" },
    ],
    answerHtml: `A 2021 NFT project: 10,946 generative gator characters composed from 327 hand-drawn attributes and minted on Polygon <cite data-n="glitchy-gator-club-nfts">glitchy-gator-club-nfts</cite>. Jake drew the parts, wrote the generator, and ran the mint himself <cite data-n="jake-herridge">jake-herridge</cite>. The machine in <a href="/exhibits/gators/">the gator room</a> rolls the same 327 layers with the mint's real rarity weights, one red button per gator.`,
  },
  {
    id: "pocketwild",
    q: "What is PocketWild?",
    key: "WILD",
    steps: [
      { op: "scan", text: "index/_digest.md · kind: project · tag: ios" },
      { op: "match", text: "pocket-wild (project · verified)" },
      { op: "open", text: "pocket-wild" },
      { op: "hop", text: "part_of ← pocketwild-website" },
      { op: "check", text: "statuses: verified · verified" },
      { op: "write", text: "narrate over 2 nodes, cite each" },
    ],
    answerHtml: `A native iOS field journal: photograph creatures and plants, keep a private local collection, no accounts and no feed <cite data-n="pocket-wild">pocket-wild</cite>. Its marketing site is its own small project in the graph <cite data-n="pocketwild-website">pocketwild-website</cite>. The app lives at <a href="https://www.pocketwild.app/" rel="noopener">pocketwild.app</a>, and <a href="/exhibits/pocketwild/">the room here</a> runs on its real species data, narrated by Aldo.`,
  },
  {
    id: "sword",
    q: "What is The Boy and the Sword?",
    key: "SWORD",
    steps: [
      { op: "scan", text: "index/_digest.md · kind: source · tag: stories" },
      { op: "match", text: "the-boy-and-the-sword (source · verified)" },
      { op: "open", text: "the-boy-and-the-sword" },
      { op: "hop", text: "related_to → jake-herridge" },
      { op: "write", text: "narrate over 2 nodes, cite each" },
    ],
    answerHtml: `A short story Jake wrote: a boy loses the magic sword that did everything for him and finds out what he can do without it <cite data-n="the-boy-and-the-sword">the-boy-and-the-sword</cite> <cite data-n="jake-herridge">jake-herridge</cite>. It reads at walking pace in <a href="/exhibits/sword/">its own room</a>, where the satchel fills with what the boy earns as the sword fades.`,
  },
];

// The "feed it" replays: real nodes whose ingestion the room re-enacts. The
// scrap shown is the node's actual provenance; the tags and edges that
// animate on are its real frontmatter, in the order the plugin writes them.
export const feedIds = [
  "choosing-your-response",
  "karpathy-obsidian-rag",
  "inner-engineering-sadhguru",
];
