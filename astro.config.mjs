import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://oumaystore-hub.github.io',
  base: '/Th-tech',
  // تم إزالة integrations: [sitemap()] لتجنب التعارض مع الملف اليدوي
  markdown: {
    shikiConfig: {
      theme: 'one-dark-pro',
    },
  },
});
