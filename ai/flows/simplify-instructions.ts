'use server';
/**
 * @fileOverview An AI agent that simplifies DIY project instructions.
 *
 * - simplifyInstructions - A function that simplifies the instructions for a DIY project.
 * - SimplifyInstructionsInput - The input type for the simplifyInstructions function.
 * - SimplifyInstructionsOutput - The return type for the simplifyInstructions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SimplifyInstructionsInputSchema = z.object({
  instructions: z.string().describe('The original step-by-step instructions for a DIY project.'),
  skillLevel: z
    .enum(['beginner', 'intermediate', 'advanced'])
    .describe('The user skill level, which can be beginner, intermediate, or advanced.'),
});
export type SimplifyInstructionsInput = z.infer<typeof SimplifyInstructionsInputSchema>;

const SimplifyInstructionsOutputSchema = z.object({
  simplifiedInstructions: z
    .string()
    .describe('The simplified step-by-step instructions for the DIY project.'),
});
export type SimplifyInstructionsOutput = z.infer<typeof SimplifyInstructionsOutputSchema>;

export async function simplifyInstructions(input: SimplifyInstructionsInput): Promise<SimplifyInstructionsOutput> {
  return simplifyInstructionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'simplifyInstructionsPrompt',
  input: {schema: SimplifyInstructionsInputSchema},
  output: {schema: SimplifyInstructionsOutputSchema},
  prompt: `You are an expert in simplifying instructions for DIY projects.

Given the following instructions and the user's skill level, simplify the instructions so that a user of that skill level can complete the project more easily.

Skill Level: {{{skillLevel}}}

Original Instructions: {{{instructions}}}

Simplified Instructions:`,
});

const simplifyInstructionsFlow = ai.defineFlow(
  {
    name: 'simplifyInstructionsFlow',
    inputSchema: SimplifyInstructionsInputSchema,
    outputSchema: SimplifyInstructionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
