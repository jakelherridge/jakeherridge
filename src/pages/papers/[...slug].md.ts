import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

export async function getStaticPaths() {
  const papers = await getCollection("papers", (p) => p.data.status === "published");
  return papers.map((paper) => ({ params: { slug: paper.id }, props: { paper } }));
}

export const GET: APIRoute = ({ props }) => {
  const paper = props.paper;
  // Coalesce an empty body so a frontmatter-only stub never serializes "undefined".
  const body = paper.body ?? "";
  const header = `# ${paper.data.title}\n\n> ${paper.data.description}\n\nBy Jake Herridge. https://jakeherridge.com/papers/${paper.id}/\n\n---\n\n`;
  return new Response(header + body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
