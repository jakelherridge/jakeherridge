// The Map: Jake as a typed graph. Nodes are things he made, wrote, believes,
// or was shaped by; edges say how they connect. This is the public cousin of
// Synapse, his Obsidian knowledge system, and it feeds both the interactive
// map and the /graph.json endpoint that agents can read.

export type NodeKind = "person" | "build" | "paper" | "creative" | "value" | "influence" | "life";
export type EdgeRel = "made" | "wrote" | "shaped" | "led_to" | "part_of" | "related";
export type NodeStatus = "shipped" | "shelved" | "growing";

export interface GraphNode {
  id: string;
  label: string;
  kind: NodeKind;
  summary: string;
  href?: string;
  status?: NodeStatus;
}

export interface GraphEdge {
  from: string;
  to: string;
  rel: EdgeRel;
}

export const kindMeta: Record<NodeKind, { label: string; color: string }> = {
  person: { label: "Me", color: "#1b1a17" },
  build: { label: "Builds", color: "#1f6b54" },
  paper: { label: "Papers", color: "#31506b" },
  creative: { label: "Creative work", color: "#9c4a2c" },
  value: { label: "Values", color: "#a97e2f" },
  influence: { label: "Influences", color: "#6c6a63" },
  life: { label: "Life", color: "#7a6a56" },
};

// How an edge reads aloud, in each direction.
export const relPhrase: Record<EdgeRel, { forward: string; reverse: string }> = {
  made: { forward: "made", reverse: "made by" },
  wrote: { forward: "wrote", reverse: "written by" },
  shaped: { forward: "shaped", reverse: "shaped by" },
  led_to: { forward: "led to", reverse: "grew out of" },
  part_of: { forward: "is part of", reverse: "includes" },
  related: { forward: "related to", reverse: "related to" },
};

export const nodes: GraphNode[] = [
  {
    id: "jake",
    label: "Jake Herridge",
    kind: "person",
    summary: "Builder and writer in Bentonville, Arkansas.",
    href: "/about/",
  },

  // Builds
  {
    id: "pocketwild",
    label: "PocketWild",
    kind: "build",
    status: "shipped",
    summary: "A native iOS field journal. Every creature you find gets a name.",
    href: "https://www.pocketwild.app/",
  },
  {
    id: "synapse",
    label: "Synapse",
    kind: "build",
    status: "growing",
    summary: "A knowledge graph of typed nodes and typed edges. This map uses the same structure.",
    href: "/collection/#synapse",
  },
  {
    id: "synapse-capture",
    label: "Synapse Capture",
    kind: "build",
    status: "shipped",
    summary: "A Claude Code plugin that saves a session's defining moments into the graph.",
    href: "/collection/#synapse-capture",
  },
  {
    id: "apd",
    label: "APD Storytelling System",
    kind: "build",
    status: "shipped",
    summary: "Turns messy operational data into briefs and decks a board will actually read.",
    href: "https://github.com/jakelherridge/apd-storytelling-system",
  },
  {
    id: "kitchen-happy",
    label: "Kitchen Happy",
    kind: "build",
    status: "shipped",
    summary: "Real recipes and the skills to cook them, built with my wife Haley.",
    href: "https://kitchenhappy.club/",
  },
  {
    id: "making-moves",
    label: "Making Moves PT",
    kind: "build",
    status: "shipped",
    summary: "A marketing site for a friend's mobile physical therapy practice.",
    href: "/collection/#making-moves",
  },
  {
    id: "ai-hub",
    label: "The AI Hub",
    kind: "build",
    status: "shipped",
    summary: "A single sign-on portal for a company's internal AI tools, with usage tracking.",
    href: "/collection/#inside",
  },
  {
    id: "perf-reviews",
    label: "Automated reviews",
    kind: "build",
    status: "shipped",
    summary: "An automated review system that writes results into the system of record.",
    href: "/collection/#inside",
  },
  {
    id: "threed",
    label: "A 3D image maker",
    kind: "build",
    status: "shelved",
    summary: "Generated 3D-effect images from flat photos. Shelved without a real use.",
    href: "/collection/#shelved",
  },
  {
    id: "wardrobe",
    label: "A wardrobe tool",
    kind: "build",
    status: "shelved",
    summary: "Matched clothing colors to a personal palette. Built for myself, then shelved.",
    href: "/collection/#shelved",
  },
  {
    id: "occ-codes",
    label: "A wage data tool",
    kind: "build",
    status: "shelved",
    summary: "Generated occupation codes and wage levels. Shelved over unreliable source data.",
    href: "/collection/#shelved",
  },

  // Papers
  {
    id: "compute-then-narrate",
    label: "Compute, Then Narrate",
    kind: "paper",
    summary: "How to trust AI generated numbers when a smarter model will not get you there.",
    href: "/papers/compute-then-narrate/",
  },
  {
    id: "abundance-or-scarcity",
    label: "Abundance or Scarcity",
    kind: "paper",
    summary: "Two cultures for the AI moment, and why the best operators run both.",
    href: "/papers/abundance-or-scarcity/",
  },
  {
    id: "dashboards-to-decisions",
    label: "From Dashboards to Decisions",
    kind: "paper",
    summary: "Most analytics stacks do not drive action. The fix is not a better dashboard.",
    href: "/papers/from-dashboards-to-decisions/",
  },

  // Creative work
  {
    id: "boy-sword",
    label: "The Boy and the Sword",
    kind: "creative",
    summary: "A story about a boy, a lost magic sword, and learning to fry your own egg.",
    href: "/stories/the-boy-and-the-sword/",
  },
  {
    id: "fall-morning",
    label: "A Fall Morning",
    kind: "creative",
    summary: "A haiku from a morning walk.",
    href: "/stories/a-fall-morning/",
  },
  {
    id: "gators",
    label: "Glitchy Gators",
    kind: "creative",
    summary: "Ten thousand generative gators built from three hundred hand made attributes.",
    href: "/collection/#gators",
  },
  {
    id: "keycaps",
    label: "Tiny Keycaps",
    kind: "creative",
    summary: "Keycaps sculpted by hand, molded, and cast in resin.",
    href: "/collection/#keycaps",
  },
  {
    id: "eagle-sword",
    label: "Ornate Eagle Sword",
    kind: "creative",
    summary: "A pencil sketch where American and Japanese design meet.",
    href: "/collection/#eagle-sword",
  },

  // Values
  {
    id: "curiosity",
    label: "Curiosity compounds",
    kind: "value",
    summary: "Take things apart to see how they work. Keep what that teaches.",
  },
  {
    id: "moments",
    label: "Moments matter",
    kind: "value",
    summary: "Time comes in small portions. Spend them on purpose.",
  },
  {
    id: "why-first",
    label: "Why before how",
    kind: "value",
    summary: "If I cannot say why a thing should exist, I do not build it.",
  },
  {
    id: "infinite-game",
    label: "The infinite game",
    kind: "value",
    summary: "Play to keep playing, not to finish.",
  },
  {
    id: "honest-flops",
    label: "Honest flops",
    kind: "value",
    summary: "I show the shelved projects next to the shipped ones.",
  },
  {
    id: "boring-work",
    label: "People over busywork",
    kind: "value",
    summary: "Get the boring work off people so they can do the human part.",
  },

  // Influences
  {
    id: "frankl",
    label: "Viktor Frankl",
    kind: "influence",
    summary: "A why that can carry any how.",
  },
  {
    id: "fadell",
    label: "Tony Fadell",
    kind: "influence",
    summary: "Make the painkiller, not the vitamin.",
  },
  {
    id: "carse",
    label: "James Carse",
    kind: "influence",
    summary: "Finite games end. Infinite games continue.",
  },
  {
    id: "belsky",
    label: "Scott Belsky",
    kind: "influence",
    summary: "The messy middle is the actual job.",
  },
  {
    id: "maltz",
    label: "Maxwell Maltz",
    kind: "influence",
    summary: "The story you tell about yourself can be rewritten.",
  },
  {
    id: "epstein",
    label: "David Epstein",
    kind: "influence",
    summary: "Range beats a head start.",
  },
  {
    id: "karpathy",
    label: "Andrej Karpathy",
    kind: "influence",
    summary: "A clever file structure beats a retrieval pipeline.",
  },
  {
    id: "leopold",
    label: "Aldo Leopold",
    kind: "influence",
    summary: "Look closely at the land. Keep a journal. PocketWild's narrator is named for him.",
  },

  // Life
  {
    id: "bentonville",
    label: "Bentonville, AR",
    kind: "life",
    summary: "Home. Trails out the back door.",
  },
  {
    id: "family",
    label: "The family",
    kind: "life",
    summary: "A wife, four kids, and the reason for all of it.",
  },
];

export const edges: GraphEdge[] = [
  // Made and wrote
  { from: "jake", to: "pocketwild", rel: "made" },
  { from: "jake", to: "synapse", rel: "made" },
  { from: "jake", to: "synapse-capture", rel: "made" },
  { from: "jake", to: "apd", rel: "made" },
  { from: "jake", to: "kitchen-happy", rel: "made" },
  { from: "jake", to: "making-moves", rel: "made" },
  { from: "jake", to: "ai-hub", rel: "made" },
  { from: "jake", to: "perf-reviews", rel: "made" },
  { from: "jake", to: "threed", rel: "made" },
  { from: "jake", to: "wardrobe", rel: "made" },
  { from: "jake", to: "occ-codes", rel: "made" },
  { from: "jake", to: "gators", rel: "made" },
  { from: "jake", to: "keycaps", rel: "made" },
  { from: "jake", to: "eagle-sword", rel: "made" },
  { from: "jake", to: "compute-then-narrate", rel: "wrote" },
  { from: "jake", to: "abundance-or-scarcity", rel: "wrote" },
  { from: "jake", to: "dashboards-to-decisions", rel: "wrote" },
  { from: "jake", to: "boy-sword", rel: "wrote" },
  { from: "jake", to: "fall-morning", rel: "wrote" },

  // Influences shape values and builds
  { from: "frankl", to: "why-first", rel: "shaped" },
  { from: "fadell", to: "why-first", rel: "shaped" },
  { from: "maltz", to: "why-first", rel: "shaped" },
  { from: "carse", to: "infinite-game", rel: "shaped" },
  { from: "belsky", to: "infinite-game", rel: "shaped" },
  { from: "epstein", to: "curiosity", rel: "shaped" },
  { from: "karpathy", to: "synapse", rel: "shaped" },
  { from: "leopold", to: "pocketwild", rel: "shaped" },

  // Life shapes the work
  { from: "family", to: "pocketwild", rel: "shaped" },
  { from: "family", to: "kitchen-happy", rel: "shaped" },
  { from: "family", to: "bentonville", rel: "related" },

  // Papers, builds, and values talk to each other
  { from: "compute-then-narrate", to: "synapse", rel: "shaped" },
  { from: "synapse-capture", to: "synapse", rel: "part_of" },
  { from: "dashboards-to-decisions", to: "apd", rel: "related" },
  { from: "abundance-or-scarcity", to: "boring-work", rel: "related" },
  { from: "occ-codes", to: "compute-then-narrate", rel: "related" },
  { from: "threed", to: "why-first", rel: "led_to" },
  { from: "wardrobe", to: "why-first", rel: "led_to" },
  { from: "boring-work", to: "ai-hub", rel: "shaped" },
  { from: "boring-work", to: "perf-reviews", rel: "shaped" },

  // Creative threads
  { from: "boy-sword", to: "curiosity", rel: "related" },
  { from: "gators", to: "pocketwild", rel: "related" },
  { from: "moments", to: "fall-morning", rel: "shaped" },
  { from: "infinite-game", to: "honest-flops", rel: "related" },
];
