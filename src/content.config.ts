import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  // استخدام loader glob لقراءة ملفات markdown
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string(),
    author: z.string().optional().default('Th.Tech'),
    image: z.string().optional(),
  }),
});

export const collections = { blog };
