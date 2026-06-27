'use server';

/**
 * @fileOverview A universal AI tool flow that implements the Firebase AI Prompt Library.
 * 
 * - universalAiTool - Handles various text processing tasks like translation, analysis, and summarization.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TaskCategorySchema = z.enum([
  'analysis',
  'summarization',
  'translation',
  'data',
  'chat',
  'creative'
]);

const UniversalAiInputSchema = z.object({
  category: TaskCategorySchema,
  promptSelection: z.string().describe('The specific prompt instruction chosen from the library.'),
  text: z.string().describe('The input text to be processed.'),
});

export type UniversalAiInput = z.infer<typeof UniversalAiInputSchema>;

const UniversalAiOutputSchema = z.object({
  result: z.string().describe('The processed output from the AI.'),
  metadata: z.record(z.any()).optional().describe('Optional structured metadata if requested.'),
});

export type UniversalAiOutput = z.infer<typeof UniversalAiOutputSchema>;

export async function universalAiTool(input: UniversalAiInput): Promise<UniversalAiOutput> {
  return universalAiToolFlow(input);
}

const prompt = ai.definePrompt({
  name: 'universalAiPrompt',
  input: {schema: UniversalAiInputSchema},
  output: {schema: UniversalAiOutputSchema},
  prompt: `You are Louis's Advanced AI Engine for the School's DIY Hub. 
  
Task Category: {{{category}}}
Specific Instruction: {{{promptSelection}}}

Input Text:
"""
{{{text}}}
"""

Execute the instruction precisely. If the instruction asks for JSON or structured data, ensure the output fits the 'result' field as a string representation of that data, or provide it clearly.

Louis's Processed Result:`,
});

const universalAiToolFlow = ai.defineFlow(
  {
    name: 'universalAiToolFlow',
    inputSchema: UniversalAiInputSchema,
    outputSchema: UniversalAiOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
