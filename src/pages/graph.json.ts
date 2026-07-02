import type { APIRoute } from "astro";
import { nodes, edges, relPhrase, kindMeta } from "../data/graph";
import { person } from "../data/person";

const SITE = person.url;

// The same graph that powers /map/, for agents. Node hrefs are absolute.
export const GET: APIRoute = () => {
  const body = {
    about: "Jake Herridge as a typed graph: builds, papers, creative work, values, influences, life.",
    note: "Edges are typed. Read an edge as: FROM (rel) TO, e.g. 'frankl shaped why-first'. The human version lives at " + SITE + "/map/.",
    kinds: Object.fromEntries(
      Object.entries(kindMeta).map(([k, v]) => [k, v.label]),
    ),
    relations: Object.fromEntries(
      Object.entries(relPhrase).map(([k, v]) => [k, v.forward]),
    ),
    nodes: nodes.map((n) => ({
      id: n.id,
      label: n.label,
      kind: n.kind,
      summary: n.summary,
      ...(n.status ? { status: n.status } : {}),
      ...(n.href ? { href: n.href.startsWith("http") ? n.href : SITE + n.href } : {}),
    })),
    edges,
  };
  return new Response(JSON.stringify(body, null, 2), {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
