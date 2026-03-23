import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';


const posts = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/posts' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.coerce.date(),
        tags: z.array(z.string()),
        img: z.string(),
        img_alt: z.string().optional().nullable(),
    }),
});

const work = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md', base: './src/content/work' }),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.coerce.date(),
        tags: z.array(z.string()),
        img: z.string(),
        img_alt: z.string().optional().nullable(),
    }),
});

export const collections = {
    posts,
    work,
};
