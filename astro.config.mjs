// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import paperPdf from './integrations/pdf.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://jakeherridge.com',
  redirects: {
    '/work/': '/collection/',
    '/lab/': '/collection/',
  },
  integrations: [mdx(), sitemap(), paperPdf()],
  vite: {
    plugins: [tailwindcss()],
  },
});
