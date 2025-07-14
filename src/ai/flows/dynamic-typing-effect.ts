// This is an AI-powered full-stack application built with NextJS, Firebase, and Genkit.

'use server';

/**
 * @fileOverview Implements a dynamic typing effect for the hero section of the homepage using AI.
 *
 * The AI intelligently selects and displays various skills (e.g., 'MERN Stack Developer') to keep the presentation fresh and engaging.
 *
 * - `generateTypingEffect` - A function that generates the dynamic typing effect.
 * - `GenerateTypingEffectInput` - The input type for the `generateTypingEffect` function.
 * - `GenerateTypingEffectOutput` - The return type for the `generateTypingEffect` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTypingEffectInputSchema = z.object({
  skills: z
    .array(z.string())
    .describe('An array of skills to choose from for the dynamic typing effect.'),
  numSkillsToDisplay: z
    .number()
    .min(1)
    .max(5)
    .default(3)
    .describe('The number of skills to display in the typing effect.'),
});
export type GenerateTypingEffectInput = z.infer<typeof GenerateTypingEffectInputSchema>;

const GenerateTypingEffectOutputSchema = z.object({
  selectedSkills: z
    .array(z.string())
    .describe('The skills selected for the dynamic typing effect.'),
});
export type GenerateTypingEffectOutput = z.infer<typeof GenerateTypingEffectOutputSchema>;

export async function generateTypingEffect(input: GenerateTypingEffectInput): Promise<GenerateTypingEffectOutput> {
  return generateTypingEffectFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTypingEffectPrompt',
  input: {schema: GenerateTypingEffectInputSchema},
  output: {schema: GenerateTypingEffectOutputSchema},
  prompt: `You are a creative content generator for a personal portfolio website.

  Given a list of skills, you will select a subset of them to be displayed in a dynamic typing effect on the hero section of the homepage.
  The goal is to keep the presentation fresh and engaging by intelligently selecting different skills each time.

  Skills: {{skills}}
  Number of skills to display: {{numSkillsToDisplay}}

  Select {{numSkillsToDisplay}} skills from the list above. Ensure the selection is varied and relevant to a full-stack web developer.
  Return the selected skills in the 'selectedSkills' field.
`,
});

const generateTypingEffectFlow = ai.defineFlow(
  {
    name: 'generateTypingEffectFlow',
    inputSchema: GenerateTypingEffectInputSchema,
    outputSchema: GenerateTypingEffectOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
