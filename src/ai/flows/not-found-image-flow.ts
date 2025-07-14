'use server';

/**
 * @fileOverview A Genkit flow to generate the background image for the 404 page.
 *
 * - generateNotFoundImage - A function that generates an image.
 * - GenerateNotFoundImageOutput - The return type for the generateNotFoundImage function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateNotFoundImageOutputSchema = z.object({
  url: z
    .string()
    .describe('The data URI of the generated image.'),
});
export type GenerateNotFoundImageOutput = z.infer<
  typeof GenerateNotFoundImageOutputSchema
>;

const generateNotFoundImageFlow = ai.defineFlow(
  {
    name: 'generateNotFoundImageFlow',
    outputSchema: GenerateNotFoundImageOutputSchema,
  },
  async () => {
    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `A beautiful and cinematic 404 error page image.
      A single person sits at a retro, boxy computer terminal on a grassy hill under a vast, partly cloudy sky.
      The scene has a serene, slightly surreal, and lonely feeling.
      The style is reminiscent of a vintage sci-fi book cover with a soft, slightly grainy texture.
      The color palette is natural, with green grass, rocky outcrops, and a blue sky.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
      throw new Error('Image generation failed.');
    }

    return { url: media.url };
  }
);

export async function generateNotFoundImage(): Promise<GenerateNotFoundImageOutput> {
  return generateNotFoundImageFlow();
}
