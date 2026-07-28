// The "ask it" demonstrations: four real questions, each answered by
// walking the exported nodes along their actual typed edges. Traces are
// authored, but every hop names a real edge in /synapse/nodes.json and
// every citation links to a real node in the stacks below.

export interface TraceStep {
  op: string; // scan | match | open | hop | check | write
  text: string;
}

export interface Demo {
  id: string;
  q: string;
  steps: TraceStep[];
  answerHtml: string;
}

export const demos: Demo[] = [
  {
    id: "origin",
    q: "What is Synapse and where did it come from?",
    steps: [
      { op: "scan", text: "index/_digest.md · 49 rows · summaries, kinds, edges" },
      { op: "match", text: "synapse — \"an AI-first knowledge graph of typed nodes\"" },
      { op: "open", text: "synapse (project · verified)" },
      { op: "hop", text: "derived_from → karpathy-obsidian-rag" },
      { op: "hop", text: "derived_from → infinite-brain" },
      { op: "hop", text: "related_to → typed-connective-tissue" },
      { op: "check", text: "statuses: verified · verified · verified" },
      { op: "write", text: "narrate over 4 nodes, cite each" },
    ],
    answerHtml: `Synapse is a personal knowledge graph: small typed nodes joined by typed edges, each node carrying its source and a verification status <cite data-n="synapse">synapse</cite>. It began as Andrej Karpathy's Obsidian pattern, where a clever file structure plus LLM traversal replaces a retrieval pipeline <cite data-n="karpathy-obsidian-rag">karpathy-obsidian-rag</cite>, took its atomic-abstraction rules from the Infinite Brain rebuild <cite data-n="infinite-brain">infinite-brain</cite>, and added edge typing because how two ideas connect matters as much as that they connect <cite data-n="typed-connective-tissue">typed-connective-tissue</cite>.`,
  },
  {
    id: "no-vectors",
    q: "Why is there no vector database?",
    steps: [
      { op: "scan", text: "index/_digest.md · query: embeddings, retrieval" },
      { op: "match", text: "structure-not-embeddings (concept · verified)" },
      { op: "open", text: "structure-not-embeddings" },
      { op: "hop", text: "derived_from → karpathy-obsidian-rag" },
      { op: "hop", text: "related_to → synapse" },
      { op: "check", text: "statuses: verified · verified" },
      { op: "write", text: "narrate over 3 nodes, cite each" },
    ],
    answerHtml: `Because at personal scale it is not needed. A deliberate file structure plus an AI that can traverse it replaces retrieval: no vector database, no embeddings, no pipeline <cite data-n="structure-not-embeddings">structure-not-embeddings</cite>. The pattern comes from Karpathy's own vault <cite data-n="karpathy-obsidian-rag">karpathy-obsidian-rag</cite>, and Synapse keeps it: the routing digest is a table an AI can scan for pennies, and the edges tell it where to walk next <cite data-n="synapse">synapse</cite>.`,
  },
  {
    id: "books",
    q: "What do four very different books agree on?",
    steps: [
      { op: "scan", text: "index/_digest.md · kind: concept · tag: personal-growth" },
      { op: "match", text: "meaning-and-purpose — \"the why must precede the how\"" },
      { op: "open", text: "meaning-and-purpose (concept · verified)" },
      { op: "hop", text: "derived_from → mans-search-for-meaning-viktor-frankl" },
      { op: "hop", text: "derived_from → build-tony-fadell" },
      { op: "hop", text: "derived_from → psycho-cybernetics-maxwell-maltz" },
      { op: "hop", text: "derived_from → the-infinite-game-simon-sinek" },
      { op: "check", text: "4 independent sources, one concept node" },
      { op: "write", text: "narrate the convergence, cite all 5" },
    ],
    answerHtml: `That a durable why comes before any how <cite data-n="meaning-and-purpose">meaning-and-purpose</cite>. Frankl frames it as survival: a reason to live carries a person through almost anything <cite data-n="mans-search-for-meaning-viktor-frankl">mans-search-for-meaning</cite>. Fadell applies the same word to products <cite data-n="build-tony-fadell">build-tony-fadell</cite>, Maltz makes direction the first letter of his success formula <cite data-n="psycho-cybernetics-maxwell-maltz">psycho-cybernetics</cite>, and Sinek removes the finish line entirely <cite data-n="the-infinite-game-simon-sinek">the-infinite-game</cite>. Four shelves, one conclusion.`,
  },
  {
    id: "disagree",
    q: "Can it disagree with itself?",
    steps: [
      { op: "scan", text: "lint pass · looking for contradicts edges" },
      { op: "match", text: "small-store-sortation-footprint (finding · not-yet-verified)" },
      { op: "open", text: "small-store-sortation-footprint" },
      { op: "hop", text: "contradicts → standardize-one-sortation-layout (decision)" },
      { op: "hop", text: "depends_on ← q3-sortation-rollout (roadmap-step)" },
      { op: "check", text: "one side is not-yet-verified · flag, do not settle" },
      { op: "write", text: "surface the conflict, cite both sides" },
    ],
    answerHtml: `Yes, on purpose. In the synthetic demo wing, a finding says stores under 30,000 square feet cannot fit the standard sortation footprint <cite data-n="small-store-sortation-footprint">small-store-sortation-footprint</cite>, and it carries an explicit contradicts edge to the decision that standardized one layout for all 400 stores <cite data-n="standardize-one-sortation-layout">standardize-one-sortation-layout</cite>, which the Q3 rollout depends on <cite data-n="q3-sortation-rollout">q3-sortation-rollout</cite>. The finding is marked not-yet-verified, so the graph holds the disagreement open instead of quietly resolving it. A human settles it; the system just refuses to forget it.`,
  },
];
