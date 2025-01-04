import { glob } from 'astro/loaders';
import { defineCollection, z } from 'astro:content';


const posts = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md'}),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.coerce.date(),
        tags: z.array(z.string()),
        img: z.string(),
        img_alt: z.string().optional(),
    }),
});

const work = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md'}),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.coerce.date(),
        tags: z.array(z.string()),
        img: z.string(),
        img_alt: z.string().optional(),
    }),
});

export const collections = defineCollection({
    loader: glob({ pattern: '**/[^_]*.md'}),
    schema: z.object({
        title: z.string(),
        description: z.string(),
        publishDate: z.coerce.date(),
        tags: z.array(z.string()),
        img: z.string(),
        img_alt: z.string().optional(),
    }),
});


// export const collections = {
//     posts,
//     work,
// };
