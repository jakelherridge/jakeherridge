// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import paperPdf from './integrations/pdf.mjs';

// https://astro.build/config
// /work/, /lab/, and the old story URL redirect in netlify.toml as real 301s;
// defining them here too would emit meta-refresh pages that shadow them.
export default defineConfig({
  site: 'https://jakeherridge.com',
  // Out of the sitemap: the monster print sheet (a query-param utility view,
  // carries noindex) and the Synapse room (live at its URL but unlisted while
  // it waits for its overhaul).
  integrations: [
    mdx(),
    sitemap({
      filter: (page) =>
        !page.includes('/exhibits/monsters/print') && !page.includes('/exhibits/synapse'),
    }),
    paperPdf(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
