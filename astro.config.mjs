// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import paperPdf from './integrations/pdf.mjs';

// https://astro.build/config
// /work/ and /lab/ redirects live in netlify.toml as real 301s; defining them
// here too would emit meta-refresh pages that shadow the server redirects.
export default defineConfig({
  site: 'https://jakeherridge.com',
  integrations: [mdx(), sitemap(), paperPdf()],
  vite: {
    plugins: [tailwindcss()],
  },
});
