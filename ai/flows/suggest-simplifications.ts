'use server';

/**
 * @fileOverview An AI agent that suggests simplifications to DIY project steps.
 *
 * - suggestSimplifications - A function that suggests simplifications to project steps based on user skill level.
 * - SuggestSimplificationsInput - The input type for the suggestSimplifications function.
 * - SuggestSimplificationsOutput - The return type for the suggestSimplifications function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestSimplificationsInputSchema = z.object({
  instructions: z.string().describe('The original step-by-step instructions for a DIY project.'),
  skillLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The user skill level, which can be beginner, intermediate, or advanced.'),
});
export type SuggestSimplificationsInput = z.infer<typeof SuggestSimplificationsInputSchema>;

const SuggestSimplificationsOutputSchema = z.object({
  simplifiedInstructions: z
    .string()
    .describe('The simplified step-by-step instructions for the DIY project, tailored to the user skill level.'),
});
export type SuggestSimplificationsOutput = z.infer<typeof SuggestSimplificationsOutputSchema>;

export async function suggestSimplifications(input: SuggestSimplificationsInput): Promise<SuggestSimplificationsOutput> {
  return suggestSimplificationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestSimplificationsPrompt',
  input: {schema: SuggestSimplificationsInputSchema},
  output: {schema: SuggestSimplificationsOutputSchema},
  prompt: `You are an expert in simplifying instructions for DIY projects based on skill level.\n\nGiven the following instructions and the user's skill level, suggest simplifications to the instructions so that a user of that skill level can complete the project more easily.\n\nSkill Level: {{{skillLevel}}}\n\nOriginal Instructions: {{{instructions}}}\n\nSuggested Simplifications:`,
});

const suggestSimplificationsFlow = ai.defineFlow(
  {
    name: 'suggestSimplificationsFlow',
    inputSchema: SuggestSimplificationsInputSchema,
    outputSchema: SuggestSimplificationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
