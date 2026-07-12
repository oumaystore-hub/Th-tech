import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://oumaystore-hub.github.io',
  base: '/Th-tech',
  integrations: [sitemap()],
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
    },
  },
});
