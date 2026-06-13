import { z, defineCollection } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    author: z.string().optional(),
    image: z.string().optional(),
  }),
});

export const collections = {
  blog: blogCollection,
};
