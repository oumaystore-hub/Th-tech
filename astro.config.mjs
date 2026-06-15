// astro.config.mjs
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://oumaystore-hub.github.io',
  base: '/Th-tech/',
  trailingSlash: 'never', // جرب هذا بدلاً من 'always'
  output: 'static',
});
