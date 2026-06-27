'use server';

/**
 * @fileOverview An AI agent that suggests edits for a DIY project video.
 *
 * - suggestVideoEdits - A function that suggests edits for a video based on project context.
 * - SuggestVideoEditsInput - The input type for the suggestVideoEdits function.
 * - SuggestVideoEditsOutput - The return type for the suggestVideoEdits function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestVideoEditsInputSchema = z.object({
  projectTitle: z.string().describe('The title of the DIY project.'),
  projectDescription: z.string().describe('The description of the DIY project.'),
  userRole: z
    .string()
    .describe("The role of the user (e.g., 'Pupil', 'Patron')."),
  ageBracket: z
    .string()
    .describe("The age bracket of the user (e.g., '13-15')."),
  userGoal: z.string().describe("The user's personal goal or what they want to achieve."),
  videoDuration: z.number().describe('The total duration of the video in seconds.'),
});
export type SuggestVideoEditsInput = z.infer<typeof SuggestVideoEditsInputSchema>;

const SuggestVideoEditsOutputSchema = z.object({
  trimStart: z
    .number()
    .describe(
      'The suggested start time for the video trim in seconds. Should be less than the end time.'
    ),
  trimEnd: z
    .number()
    .describe(
      'The suggested end time for the video trim in seconds. Should be greater than the start time and less than the video duration.'
    ),
  filter: z
    .enum(['none', 'grayscale(100%)', 'sepia(100%)', 'brightness(1.5)', 'contrast(1.5)'])
    .describe('A suggested CSS filter to apply to the video.'),
  textOverlay: z
    .string()
    .describe('A short, catchy text overlay to add to the video (max 5 words).'),
  reasoning: z
    .string()
    .describe('A brief explanation for why these edits were suggested.'),
});
export type SuggestVideoEditsOutput = z.infer<typeof SuggestVideoEditsOutputSchema>;

export async function suggestVideoEdits(
  input: SuggestVideoEditsInput
): Promise<SuggestVideoEditsOutput> {
  return suggestVideoEditsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestVideoEditsPrompt',
  input: {schema: SuggestVideoEditsInputSchema},
  output: {schema: SuggestVideoEditsOutputSchema},
  prompt: `You are an expert video editor AI for a platform called "School's DIY Hub". Your task is to suggest creative and engaging edits for a project video.

The user is a {{userRole}} in the {{ageBracket}} age bracket, and their goal is to "{{userGoal}}".

The project is titled "{{projectTitle}}" and is described as: "{{projectDescription}}".

The video is {{videoDuration}} seconds long.

Based on this, suggest an engaging edit. Recommend a start and end time to create a short, impactful clip. Suggest a subtle filter and a catchy text overlay. The suggestions should be appropriate for the user's age and help them achieve their goal. Keep the text overlay very short and punchy.

Provide your suggestions in the specified format.`,
});

const suggestVideoEditsFlow = ai.defineFlow(
  {
    name: 'suggestVideoEditsFlow',
    inputSchema: SuggestVideoEditsInputSchema,
    outputSchema: SuggestVideoEditsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    // Ensure trim times are valid
    if (output) {
      if (output.trimStart >= output.trimEnd) {
        output.trimStart = 0; // Default to start if invalid
      }
      if (output.trimEnd > input.videoDuration) {
        output.trimEnd = input.videoDuration; // Cap at duration
      }
    }
    return output!;
  }
);
