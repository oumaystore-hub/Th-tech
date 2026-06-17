import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://oumaystore-hub.github.io',
  base: '/Th-tech',  // بدون / في النهاية
  trailingSlash: 'ignore',  // غيّر هذا السطر
  output: 'static',
});
