import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://oumaystore-hub.github.io',
  base: '/Th-tech/', // هذا السطر هو الحل! يربط الروابط بمجلد المشروع
  trailingSlash: 'always',
  output: 'static',
});
