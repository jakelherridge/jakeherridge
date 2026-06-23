// Single source of truth for Jake's identity, builds, and lab entries.
// Consumed by the Builds and Lab pages and by the JSON-LD graph (U9).

export const person = {
  name: "Jake Herridge",
  url: "https://jakeherridge.com",
  jobTitle: "Operations Leader and AI Builder",
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
  href: string;
  linkLabel: string;
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
    name: "APD Storytelling System",
    category: "Open source",
    tagline: "Raw operational data in, board-ready briefs and decks out.",
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
];

export const internalWork = [
  {
    name: "The AI Hub",
    body: "A single sign-on portal that put every internal AI tool we shipped behind one door, with usage tracked from day one. It turned one-off tools into a managed, measurable product line.",
  },
  {
    name: "Automated performance reviews",
    body: "An end-to-end system covering more than 500 employees that writes structured results straight into Workday. It saves over 2,000 hours a cycle, about $80,000 a year in labor.",
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
    title: "Internal AI tools at LER TechForce",
    outcome: "shipped",
    lesson:
      "Adoption is the whole game. A tool people open on a Tuesday beats a brilliant one nobody touches.",
  },
  {
    title: "A 3D image generator app",
    outcome: "shelved",
    lesson:
      "I chased the technology before the use. A cool demo, and no one who needed it. Now I start from the person, not the model.",
  },
  {
    title: "A color-palette and wardrobe tool",
    outcome: "shelved",
    lesson:
      "I solved a problem I had, not one a market had. Build for a real, recurring need, or do not build.",
  },
  {
    title: "An occupation-code and wage-level generator",
    outcome: "shelved",
    lesson:
      "The data was too thin to trust, and trust was the whole product. Some things should not be automated until the inputs are solid.",
  },
];
