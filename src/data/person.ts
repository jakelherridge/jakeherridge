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
  tagline: string;
  body: string;
  href?: string;
  linkLabel?: string;
  appCategory?: string; // for SoftwareApplication JSON-LD
  os?: string;
}

export const builds: Build[] = [
  {
    name: "PocketWild",
    category: "iOS app",
    tagline: "A pocket-sized field journal where every creature you find gets a name.",
    body: "A native iOS app I built end to end as a non-coder: I defined the product, drew the pixel art, and directed Claude Code through the Swift build, the iNaturalist computer vision, and the location and weather data. No ads, no subscriptions, no data collection.",
    href: "https://www.pocketwild.app/",
    linkLabel: "pocketwild.app",
    appCategory: "LifestyleApplication",
    os: "iOS",
  },
  {
    name: "Synapse",
    category: "Knowledge system",
    tagline: "A second brain built for an AI to read.",
    body: "My knowledge system. It breaks what I learn into small typed nodes joined by typed edges, and every node carries its source and a verification status. An AI can traverse it and answer with citations instead of vibes. The Map on this site is its public cousin.",
    href: "/map/",
    linkLabel: "See the public cousin",
  },
  {
    name: "Synapse Capture",
    category: "Claude Code plugin",
    tagline: "The plugin that remembers what a session decided.",
    body: "A Claude Code plugin that distills a working session's defining moments into typed nodes in Synapse. Decisions, pivots, and dead ends get captured with their provenance, so context compounds across sessions instead of being re-derived every morning.",
  },
  {
    name: "APD Storytelling System",
    category: "Open source",
    tagline: "Turns messy operational data into a brief and deck a board will actually read.",
    body: "A Node.js pipeline that turns fulfillment-automation metrics into one-page strategic briefs, a thirteen-slide executive deck, white papers, and a chart library, all from one shared design system. Built as a working demonstration on synthetic data.",
    href: "https://github.com/jakelherridge/apd-storytelling-system",
    linkLabel: "View on GitHub",
    appCategory: "BusinessApplication",
    os: "Node.js",
  },
  {
    name: "Kitchen Happy",
    category: "The web",
    tagline: "Real recipes and the skills to cook them.",
    body: "My wife Haley teaches home cooks the fundamentals, the handful of skills that make everything else easier. I help build and run the site and the content presence behind it, from the tech to the systems that keep it moving.",
    href: "https://kitchenhappy.club/",
    linkLabel: "kitchenhappy.club",
  },
  {
    name: "Making Moves PT",
    category: "The web",
    tagline: "A friend's mobile physical therapy practice, findable.",
    body: "A marketing site for a physical therapist who drives to you around Northwest Arkansas. A static site, booking that just works, and the local search plumbing that helps neighbors actually find him.",
    href: "https://makingmovespt.com",
    linkLabel: "makingmovespt.com",
  },
];

export const internalWork = [
  {
    name: "The AI Hub",
    body: "A single sign-on portal that put every internal AI tool we shipped behind one door, with usage tracked from day one. Before it, the tools were scattered and half-forgotten. After, we could see what people actually reached for.",
  },
  {
    name: "Automated performance reviews",
    body: "An automated performance-review system that took a dreaded annual scramble and turned it into something that mostly runs itself, writing its results straight into the system of record.",
  },
  {
    name: "Agents on the Anthropic API",
    body: "An agent that reads a resume and surfaces companies with matching open roles, plus resume and job-description formatters that cut hours of cleanup out of every requisition.",
  },
  {
    name: "Production automation, no developer",
    body: "I direct Claude Code to specify, build, deploy, and maintain production Python and workflow automations, without a developer in the loop.",
  },
];

export interface LabEntry {
  title: string;
  outcome: "shipped" | "shelved";
  lesson: string;
}

export const lab: LabEntry[] = [
  {
    title: "PocketWild",
    outcome: "shipped",
    lesson:
      "A non-coder can own a real product end to end, if they direct the AI well and keep the taste in their own hands.",
  },
  {
    title: "Internal AI tools at work",
    outcome: "shipped",
    lesson:
      "Adoption is the whole game. A tool only counts once people actually open it.",
  },
  {
    title: "A 3D image generator app",
    outcome: "shelved",
    lesson:
      "I chased the technology before the use. Built a cool demo nobody needed. Now I start with the person who has the problem.",
  },
  {
    title: "A color-palette and wardrobe tool",
    outcome: "shelved",
    lesson:
      "I built it for myself and figured everyone else wanted it too. They did not. Now I make sure the need is real before I start.",
  },
  {
    title: "An occupation-code and wage-level generator",
    outcome: "shelved",
    lesson:
      "The data was too thin to trust, and trust was the whole product. Some things should not be automated until the inputs are solid.",
  },
];
