'use server';

/**
 * @fileOverview A DIY project idea generator that can accept images.
 * 
 * - generateProjectIdeas - A function that generates DIY project ideas based on available materials and skill level.
 * - GenerateProjectIdeasInput - The input type for the generateProjectIdeas function.
 * - GenerateProjectIdeasOutput - The return type for the generateProjectIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProjectIdeasInputSchema = z.object({
  materials: z
    .string()
    .describe('A comma-separated list of materials the user has available.'),
  skillLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The skill level of the user.'),
  photoDataUri: z
    .string()
    .optional()
    .describe(
      "An optional photo of a user's materials, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateProjectIdeasInput = z.infer<typeof GenerateProjectIdeasInputSchema>;

const GenerateProjectIdeasOutputSchema = z.object({
  projectIdeas: z
    .array(z.string())
    .describe('A list of DIY project ideas based on the available materials and skill level.'),
});
export type GenerateProjectIdeasOutput = z.infer<typeof GenerateProjectIdeasOutputSchema>;

export async function generateProjectIdeas(
  input: GenerateProjectIdeasInput
): Promise<GenerateProjectIdeasOutput> {
  return generateProjectIdeasFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProjectIdeasPrompt',
  input: {schema: GenerateProjectIdeasInputSchema},
  output: {schema: GenerateProjectIdeasOutputSchema},
  prompt: `You are a DIY project idea generator. Given the following materials (from text and/or an image) and a skill level, suggest some DIY project ideas.

Materials (from text): {{{materials}}}
{{#if photoDataUri}}
Materials (from image): {{media url=photoDataUri}}
{{/if}}
Skill Level: {{{skillLevel}}}

Project Ideas:`,
});

const generateProjectIdeasFlow = ai.defineFlow(
  {
    name: 'generateProjectIdeasFlow',
    inputSchema: GenerateProjectIdeasInputSchema,
    outputSchema: GenerateProjectIdeasOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
