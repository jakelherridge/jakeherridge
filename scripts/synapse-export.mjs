// Synapse exhibit exporter: reads an explicit allowlist of REAL vault nodes,
// parses their frontmatter and bodies, and writes public/synapse/nodes.json.
// Privacy: career, resumes, faith drafts, and personal writings never enter
// the allowlist, and a denylist check guards against accidents. The
// jake-herridge entity is replaced by a sanitized public stub.
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const VAULT = "/Users/jake/Documents/Obsidian Jake's Brain/Jake's Brain/llm-wiki";

// ---- Allowlist: node id -> vault-relative path ----
const ALLOW = {
  // ai-systems
  "synapse": "nodes/projects/synapse.md",
  "synapse-capture": "nodes/projects/synapse-capture.md",
  "structure-not-embeddings": "nodes/ai-systems/structure-not-embeddings.md",
  "typed-connective-tissue": "nodes/ai-systems/typed-connective-tissue.md",
  "global-and-project-memory": "nodes/ai-systems/global-and-project-memory.md",
  "andrej-karpathy": "nodes/ai-systems/people/andrej-karpathy.md",
  "karpathy-obsidian-rag": "nodes/ai-systems/sources/karpathy-obsidian-rag.md",
  "infinite-brain": "nodes/ai-systems/sources/infinite-brain.md",
  "open-knowledge-format": "nodes/ai-systems/sources/open-knowledge-format.md",
  "l8-agentic-engineering-workflow": "nodes/ai-systems/sources/l8-agentic-engineering-workflow.md",
  // personal growth: concepts
  "choosing-your-response": "nodes/personal-growth/choosing-your-response.md",
  "finite-and-infinite-games": "nodes/personal-growth/finite-and-infinite-games.md",
  "inner-vs-external-fulfillment": "nodes/personal-growth/inner-vs-external-fulfillment.md",
  "leadership-and-management": "nodes/personal-growth/leadership-and-management.md",
  "meaning-and-purpose": "nodes/personal-growth/meaning-and-purpose.md",
  "product-building": "nodes/personal-growth/product-building.md",
  "resilience-and-adversity": "nodes/personal-growth/resilience-and-adversity.md",
  "self-image-and-inner-narrative": "nodes/personal-growth/self-image-and-inner-narrative.md",
  "visualization-and-mental-practice": "nodes/personal-growth/visualization-and-mental-practice.md",
  // personal growth: people
  "viktor-frankl": "nodes/personal-growth/people/viktor-frankl.md",
  "tony-fadell": "nodes/personal-growth/people/tony-fadell.md",
  "james-carse": "nodes/personal-growth/people/james-carse.md",
  "simon-sinek": "nodes/personal-growth/people/simon-sinek.md",
  "scott-belsky": "nodes/personal-growth/people/scott-belsky.md",
  "maxwell-maltz": "nodes/personal-growth/people/maxwell-maltz.md",
  "david-epstein": "nodes/personal-growth/people/david-epstein.md",
  "sadhguru": "nodes/personal-growth/people/sadhguru.md",
  // personal growth: sources
  "mans-search-for-meaning-viktor-frankl": "nodes/personal-growth/sources/mans-search-for-meaning-viktor-frankl.md",
  "build-tony-fadell": "nodes/personal-growth/sources/build-tony-fadell.md",
  "the-infinite-game-simon-sinek": "nodes/personal-growth/sources/the-infinite-game-simon-sinek.md",
  "the-messy-middle-scott-belsky": "nodes/personal-growth/sources/the-messy-middle-scott-belsky.md",
  "psycho-cybernetics-maxwell-maltz": "nodes/personal-growth/sources/psycho-cybernetics-maxwell-maltz.md",
  "inner-engineering-sadhguru": "nodes/personal-growth/sources/inner-engineering-sadhguru.md",
  "range-david-epstein": "nodes/personal-growth/sources/range-david-epstein.md",
  // public projects
  "pocket-wild": "nodes/projects/pocket-wild.md",
  "pocketwild-website": "nodes/projects/pocketwild-website.md",
  "apd-storytelling-system": "nodes/projects/apd-storytelling-system.md",
  "kitchen-happy-club": "nodes/projects/kitchen-happy-club.md",
  "making-moves-pt": "nodes/projects/making-moves-pt.md",
  "jakeherridge-site": "nodes/projects/jakeherridge-site.md",
  // public writings
  "the-boy-and-the-sword": "nodes/writings/the-boy-and-the-sword.md",
  "a-fall-morning": "nodes/writings/a-fall-morning.md",
  "glitchy-gator-club-nfts": "nodes/writings/glitchy-gator-club-nfts.md",
  "tiny-keycaps": "nodes/writings/tiny-keycaps.md",
  "ornate-eagle-sword": "nodes/writings/ornate-eagle-sword.md",
  // synthetic demo group (shows decision / finding / roadmap-step / contradicts)
  "standardize-one-sortation-layout": "nodes/_demo-fulfillment/transportation/standardize-one-sortation-layout.md",
  "q3-sortation-rollout": "nodes/_demo-fulfillment/transportation/q3-sortation-rollout.md",
  "small-store-sortation-footprint": "nodes/_demo-fulfillment/finance/small-store-sortation-footprint.md",
};

// Anything matching these can never ship, allowlist or not.
const DENY = /career|resume|beatitudes|living-and-dying|attention-vs-priority|essays-and-more|thoughts-about|silly-dog|tool-brainstorm|tools-brain-dump|margin-calculator|month-one/i;

// Sanitized public stub for the person hub so [[jake-herridge]] links resolve.
const JAKE_STUB = {
  id: "jake-herridge",
  kind: "entity",
  summary: "Jake Herridge. Father, engineer, nerd, AI guy, wannabe philosopher. Bentonville, Arkansas.",
  tags: ["jake"],
  status: "verified",
  provenance: "jakeherridge.com",
  authored_by: "human",
  edges: { related_to: ["synapse", "pocket-wild", "apd-storytelling-system"] },
  bodyHtml:
    "<p>The person this vault belongs to. The public version of this node lives at <a href=\"https://jakeherridge.com/about/\">jakeherridge.com/about</a>. The private version stays private, which is rather the point of the exercise.</p>",
  title: "Jake Herridge",
};

const EDGE_KEYS = [
  "supports",
  "contradicts",
  "depends_on",
  "derived_from",
  "part_of",
  "preceded_by",
  "followed_by",
  "related_to",
  "restates",
  "supersedes",
];

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!m) return [{}, text];
  const yaml = m[1];
  const body = text.slice(m[0].length);
  const data = {};
  let currentKey = null;
  for (const rawLine of yaml.split("\n")) {
    const listItem = rawLine.match(/^\s+-\s+"?\[\[(.+?)\]\]"?\s*$/);
    if (listItem && currentKey) {
      (data[currentKey] ||= []).push(listItem[1]);
      continue;
    }
    const kv = rawLine.match(/^([a-z_]+):\s*(.*)$/);
    if (!kv) continue;
    const [, key, raw] = kv;
    if (raw === "") {
      currentKey = key;
      data[key] = [];
    } else {
      currentKey = null;
      let v = raw.trim();
      if (v.startsWith("[") && v.endsWith("]")) {
        data[key] = v
          .slice(1, -1)
          .split(",")
          .map((s) => s.trim().replace(/^"|"$/g, ""))
          .filter(Boolean);
      } else {
        data[key] = v.replace(/^"|"$/g, "");
      }
    }
  }
  return [data, body];
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Tiny markdown renderer for the simple node bodies: headings, bold, italic,
// inline code, [[wiki links]], plain links, lists, tables dropped to text.
function mdToHtml(md, included) {
  const lines = md.split("\n");
  const out = [];
  let inList = false;
  const inline = (s) => {
    let t = esc(s);
    t = t.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, (_, id, label) =>
      included.has(id)
        ? `<a href="#node/${id}" data-wiki>${label}</a>`
        : `<span class="syn-locked" title="This node stays private">${label}</span>`,
    );
    t = t.replace(/\[\[([^\]]+)\]\]/g, (_, id) =>
      included.has(id)
        ? `<a href="#node/${id}" data-wiki>${id}</a>`
        : `<span class="syn-locked" title="This node stays private">${id}</span>`,
    );
    t = t.replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" rel="noopener">$1</a>');
    t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    t = t.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    t = t.replace(/`([^`]+)`/g, "<code>$1</code>");
    return t;
  };
  for (const line of lines) {
    const l = line.trimEnd();
    if (/^\s*$/.test(l)) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      continue;
    }
    if (/^#\s/.test(l)) continue; // node H1 becomes the card title
    const h = l.match(/^(#{2,4})\s+(.*)$/);
    if (h) {
      if (inList) {
        out.push("</ul>");
        inList = false;
      }
      out.push(`<h4>${inline(h[2])}</h4>`);
      continue;
    }
    const li = l.match(/^[-*]\s+(.*)$/);
    if (li) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(li[1])}</li>`);
      continue;
    }
    if (/^\|/.test(l)) continue; // drop table rows; digests render elsewhere
    if (/^>/.test(l)) {
      out.push(`<blockquote>${inline(l.replace(/^>\s?/, ""))}</blockquote>`);
      continue;
    }
    out.push(`<p>${inline(l)}</p>`);
  }
  if (inList) out.push("</ul>");
  return out.join("\n");
}

const included = new Set([...Object.keys(ALLOW), "jake-herridge"]);
const nodes = [JAKE_STUB];

for (const [id, rel] of Object.entries(ALLOW)) {
  if (DENY.test(rel) || DENY.test(id)) {
    throw new Error(`Denylist blocked: ${id}`);
  }
  const text = await readFile(path.join(VAULT, rel), "utf8");
  const [fm, body] = parseFrontmatter(text);
  const edges = {};
  for (const k of EDGE_KEYS) {
    if (Array.isArray(fm[k]) && fm[k].length) {
      edges[k] = fm[k].filter((t) => included.has(t));
      if (fm[k].some((t) => !included.has(t))) edges[k + "_locked"] = fm[k].length - edges[k].length;
      if (!edges[k].length) delete edges[k];
    }
  }
  const title = (text.match(/^#\s+(.*)$/m) || [])[1] || id;
  nodes.push({
    id,
    title,
    kind: fm.kind || "note",
    summary: String(fm.summary || ""),
    tags: Array.isArray(fm.tags) ? fm.tags : [],
    status: fm.status || "not-yet-verified",
    provenance: String(fm.provenance || "").replace(/\[\[|\]\]/g, ""),
    authored_by: fm.authored_by || "",
    edges,
    bodyHtml: mdToHtml(body, included),
  });
}

const OUT = new URL("../public/synapse", import.meta.url).pathname;
await mkdir(OUT, { recursive: true });
await writeFile(path.join(OUT, "nodes.json"), JSON.stringify({ nodes }));

const kinds = {};
for (const n of nodes) kinds[n.kind] = (kinds[n.kind] || 0) + 1;
console.log(`Exported ${nodes.length} nodes:`, kinds);

// Poster: a small typed-edge diagram rendered from SVG.
const sharp = (await import("sharp")).default;
const P = {
  paper: "#f4f1e9",
  ink: "#1b1a17",
  pine: "#1f6b54",
  rust: "#9c4a2c",
  gold: "#a97e2f",
  slate: "#31506b",
  muted: "#6c6a63",
  faint: "#d8d2c4",
};
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="675">
  <rect width="900" height="675" fill="${P.paper}"/>
  <g stroke-width="2.5" fill="none">
    <line x1="450" y1="340" x2="240" y2="200" stroke="${P.faint}"/>
    <line x1="450" y1="340" x2="680" y2="180" stroke="${P.faint}" stroke-dasharray="9 7"/>
    <line x1="450" y1="340" x2="700" y2="470" stroke="${P.faint}" stroke-dasharray="9 7"/>
    <line x1="450" y1="340" x2="230" y2="500" stroke="${P.faint}" stroke-dasharray="2.5 6" stroke-linecap="round"/>
    <line x1="240" y1="200" x2="680" y2="180" stroke="${P.faint}" stroke-dasharray="16 9"/>
    <line x1="230" y1="500" x2="700" y2="470" stroke="${P.rust}" stroke-dasharray="9 7"/>
  </g>
  <g font-family="Menlo, monospace" font-size="21" fill="${P.muted}">
    <circle cx="450" cy="340" r="26" fill="${P.pine}"/>
    <text x="450" y="402" text-anchor="middle" fill="${P.ink}">synapse</text>
    <circle cx="240" cy="200" r="18" fill="${P.slate}"/>
    <text x="240" y="158" text-anchor="middle">source</text>
    <circle cx="680" cy="180" r="18" fill="${P.gold}"/>
    <text x="680" y="140" text-anchor="middle">concept</text>
    <circle cx="700" cy="470" r="18" fill="${P.ink}"/>
    <text x="700" y="530" text-anchor="middle">decision</text>
    <circle cx="230" cy="500" r="18" fill="${P.rust}"/>
    <text x="230" y="560" text-anchor="middle">finding</text>
    <text x="452" y="620" text-anchor="middle" fill="${P.rust}">contradicts → carried openly</text>
  </g>
</svg>`;
await sharp(Buffer.from(svg))
  .png()
  .toFile(new URL("../src/assets/synapse-poster.png", import.meta.url).pathname);
console.log("Poster -> src/assets/synapse-poster.png");
