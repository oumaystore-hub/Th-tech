import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://oumaystore-hub.github.io',
  base: '/th-tech/', // ⬅️ ضروري جداً ليعمل الموقع كمجلد فرعي
  trailingSlash: 'ignore',
});
