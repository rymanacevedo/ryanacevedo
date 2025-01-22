---
title: Vercel AI SDK 
publishDate: 2025-01-22
img: /assets/vercel_ai_sdk.jpg
img_alt: 
description: |
    Building cools things in the AI space.
tags:
  - Vercel SDK
  - AI
  - Hono
  - Zod
  - Typescript
---
# Key Takeways
Recently, I've been tinkering on a project leveraging the Vercel SDK to test out this cool new hype term called *AI Agents*. 
Matt Pocock over at Total Typescript has an amazing course that walks you through examples of using the SDK effectively.
He also walks you through effective Prompt Engineering right from the command line and not using a UI directly seems to
be a fast experience using the OpenAI and Anthropic models. Let's walk though some of my highlights.

## Structured Outputs
What you're seeing is a basic structure input/output to create a recipe (which I myself as a health fanatnic *hate* making
my own meal prep). 
```typescript
import { generateObject } from "ai";
import { z } from "zod";
import { openai } from "@ai-sdk/openai";

const model = openai('gpt-4');
const schema = z.object({
    recipe: z.object({
        name: z.string(),
        ingredients: z.array(z.object({
            name: z.string(),
            amount: z.string()
        }).describe('The ingredients needed for the recipe.')
    ),
    steps: z.array(z.string()).describe('The steps to make the recipe.')
    }),
});

export const createRecipe = async (input: string) => 
{
    const { object } = await generateObject({
        model,
        schema,
        schemaName: 'Recipe', 
        prompt: input,
        system: `
        You are helping a user create a recipe. 
        Use British english variants of ingredients names, like Coriander over Cilantro.
`
    });

    return object.recipe;
}

const recipe = await createRecipe(`Create a recipe for a simple pasta dish with tomatoes and basil.`);

console.log(recipe);
```

### Use Cases
I can see a use case where I want to develop my own recipes daily or weekly and AI could help me make a simple menu for 
the week. Might try to setup a timer in ChatGPT and see if it makes a difference vs. building out my own.

Check out the GitHub with the code for examples: https://github.com/rymanacevedo/vercel_ai_sdk