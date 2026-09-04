import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://oumaystore-hub.github.io/Th-tech',
  integrations: [sitemap()],
  output: 'static',
});
