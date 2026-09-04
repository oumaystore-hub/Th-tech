import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://oumaystore-hub.github.io',
  base: '/Th-tech',

  output: 'static',

  integrations: [
    sitemap({
      filter: (page) => page.startsWith('https://oumaystore-hub.github.io/Th-tech/'),
    }),
  ],
});
