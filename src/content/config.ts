import { defineCollection, z } from 'astro:content';

const articles = defineCollection({
  schema: z.object({
    title: z.string(),
    category: z.enum(['ذكاء اصطناعي', 'تقنية', 'ربح رقمي', 'أداء']),
    publishDate: z.coerce.date(),
    description: z.string().optional(),
  })
});

export const collections = { articles };
