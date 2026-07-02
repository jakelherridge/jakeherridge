// Single source of truth for Jake's identity, builds, and lab entries.
// Consumed by the Builds and Lab pages and by the JSON-LD graph (U9).

export const person = {
  name: "Jake Herridge",
  url: "https://jakeherridge.com",
  jobTitle: "Builder and writer",
  location: "Bentonville, Arkansas",
  linkedin: "https://www.linkedin.com/in/jake-herridge-2722b139",
  github: "https://github.com/jakelherridge",
  // Assembled on interaction in the contact UI; never rendered raw in markup.
  emailUser: "jakelherridge",
  emailDomain: "gmail.com",
  alumniOf: "Harding University",
  knowsAbout: [
    "Operations leadership",
    "AI adoption in business",
    "Analytics and forecasting",
    "Workflow automation",
    "Agentic tooling",
    "Claude Code",
  ],
};

export interface Build {
  name: string;
  category: string;
  blurb: string; // one factual noun phrase, machine-facing (JSON-LD, llms.txt); not rendered on cards
  body: string; // catalog-label copy: what it is, in facts
  href?: string;
  linkLabel?: string;
  appCategory?: string; // for SoftwareApplication JSON-LD
  os?: string;
}

export const builds: Build[] = [
  {
    name: "PocketWild",
    category: "iOS app",
    blurb: "iOS field journal app for the outdoors",
    body: "A field journal for the outdoors: photograph creatures and plants, keep a private local collection. 228 species indexed, each with a hand-drawn sketch and a pixel sprite. 2,500 curated adventures across all 50 states. Swift, built by directing Claude Code. No accounts, no feed, no ads.",
    href: "https://www.pocketwild.app/",
    linkLabel: "pocketwild.app",
    appCategory: "LifestyleApplication",
    os: "iOS",
  },
  {
    name: "Synapse",
    category: "Knowledge system",
    blurb: "Typed-node knowledge graph built for AI traversal",
    body: "A personal knowledge graph: small typed nodes joined by typed edges, each node carrying its source and a verification status. Built for an AI to traverse and answer from with citations. The Map on this site uses the same structure.",
    href: "/map/",
    linkLabel: "See the Map",
  },
  {
    name: "Synapse Capture",
    category: "Claude Code plugin",
    blurb: "Claude Code plugin that captures session decisions into Synapse",
    body: "A Claude Code plugin. At the end of a working session it writes the session's decisions, pivots, and dead ends into Synapse as typed nodes, each with its provenance.",
  },
  {
    name: "APD Storytelling System",
    category: "Open source",
    blurb: "Pipeline from operational metrics to executive communications",
    body: "A Node.js pipeline from fulfillment-automation metrics to one-page briefs, a thirteen-slide executive deck, white papers, and a chart library, all from one shared design system. Runs on synthetic data as a public demonstration.",
    href: "https://github.com/jakelherridge/apd-storytelling-system",
    linkLabel: "github.com/jakelherridge",
    appCategory: "BusinessApplication",
    os: "Node.js",
  },
  {
    name: "Kitchen Happy",
    category: "The web",
    blurb: "Haley Herridge's recipes and cooking-skills site",
    body: "My wife Haley's cooking site: real recipes and the fundamental skills behind them. I run the site and the systems behind it.",
    href: "https://kitchenhappy.club/",
    linkLabel: "kitchenhappy.club",
  },
  {
    name: "Making Moves PT",
    category: "The web",
    blurb: "Marketing site for a mobile physical therapy practice",
    body: "A marketing site for a mobile physical-therapy practice in Northwest Arkansas. Static site, Calendly booking, structured data for local search.",
    href: "https://makingmovespt.com",
    linkLabel: "makingmovespt.com",
  },
];

export const internalWork = [
  {
    name: "The AI Hub",
    body: "A single sign-on portal that collects the company's internal AI tools in one place, with usage tracked from day one.",
  },
  {
    name: "Automated performance reviews",
    body: "An automated performance-review system that runs the annual review cycle and writes its results into the system of record.",
  },
  {
    name: "Agents on the Anthropic API",
    body: "An agent that reads a resume and surfaces companies with matching open roles, plus resume and job-description formatters that standardize every requisition.",
  },
  {
    name: "Production automation, no developer",
    body: "I direct Claude Code to specify, build, deploy, and maintain production Python and workflow automations, without a developer in the loop.",
  },
];
