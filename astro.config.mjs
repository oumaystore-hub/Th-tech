import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://oumaystore-hub.github.io',
  base: '/Th-tech/',
  trailingSlash: 'ignore', // ⬅️ هذا هو التعديل الجوهري
  output: 'static',
});
