import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://oumaystore-hub.github.io',
  base: '/Th-tech',
  integrations: [sitemap()],
  output: 'static',
});
