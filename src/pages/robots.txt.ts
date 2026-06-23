import type { APIRoute } from "astro";
import { person } from "../data/person";

// Allow-all baseline (AI answer engines welcome). Disallow the training-only
// crawler. Point to the sitemap.
const body = `# ${person.url}
User-agent: *
Allow: /

User-agent: CCBot
Disallow: /

Sitemap: ${person.url}/sitemap-index.xml
`;

export const GET: APIRoute = () =>
  new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
