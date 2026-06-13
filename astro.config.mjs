import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  base: '/Th-tech/',
  output: 'static',
  integrations: [mdx()],
});
