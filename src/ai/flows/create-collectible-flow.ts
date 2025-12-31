'use server';
/**
 * @fileOverview A flow to generate a unique AI collectible for a customer's order.
 *
 * - createCollectible - A function that generates the collectible image.
 * - CreateCollectibleInput - The input type for the createCollectible function.
 * - CreateCollectibleOutput - The return type for the createCollectible function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CreateCollectibleInputSchema = z.object({
  orderId: z.string().describe('The unique ID of the order.'),
  userName: z.string().describe('The name of the customer.'),
  products: z.array(z.string()).describe('A list of product names included in the order.'),
});
export type CreateCollectibleInput = z.infer<typeof CreateCollectibleInputSchema>;

const CreateCollectibleOutputSchema = z.object({
  collectibleImageUrl: z.string().describe("The data URI of the generated collectible image. Expected format: 'data:image/png;base64,<encoded_data>'."),
});
export type CreateCollectibleOutput = z.infer<typeof CreateCollectibleOutputSchema>;

export async function createCollectible(input: CreateCollectibleInput): Promise<CreateCollectibleOutput> {
  return createCollectibleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'createCollectiblePrompt',
  input: {schema: CreateCollectibleInputSchema},
  prompt: `You are an imaginative digital artist creating a unique, visually stunning collectible card for a fashion brand called OKTOPUS CLOTHING.

The collectible should be a masterpiece of digital art, themed around the products purchased. It should look exclusive, futuristic, and highly desirable.

**Card Details:**
- **Customer Name:** {{{userName}}}
- **Order ID:** {{{orderId}}}
- **Products Purchased:** {{#each products}}- {{{this}}}{{/each}}

**Artistic Style:**
Generate a hyper-detailed, ethereal, and slightly surreal image. Think iridescent materials, holographic effects, and abstract patterns inspired by octopus tentacles and sacred geometry. The color palette should be vibrant yet sophisticated, using deep blues, purples, and shimmering gold or silver accents. The overall feeling should be magical and exclusive.

**Composition:**
- The customer's name "{{{userName}}}" should be elegantly integrated into the design.
- The order ID "{{{orderId}}}" should be subtly placed, like a serial number.
- The design should incorporate motifs from the purchased products: {{{products}}}.

**Output Format:**
A high-resolution, visually breathtaking digital art piece. Do not include any text that is not part of the artistic design itself.`,
});

const createCollectibleFlow = ai.defineFlow(
  {
    name: 'createCollectibleFlow',
    inputSchema: CreateCollectibleInputSchema,
    outputSchema: CreateCollectibleOutputSchema,
  },
  async input => {
    const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: prompt.renderText({ input }),
        config: {
            aspectRatio: '9:16'
        }
    });

    if (!media.url) {
        throw new Error("Failed to generate collectible image.");
    }
    
    return { collectibleImageUrl: media.url };
  }
);
