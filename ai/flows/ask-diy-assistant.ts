'use server';

/**
 * @fileOverview Your Mentor Louis - Premium Innovation Mentor & Engineering Guide.
 * 
 * - askDiyAssistant - Generates code and mentors students in innovation.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskDiyAssistantInputSchema = z.object({
  question: z.string().describe('The student\'s coding question or project idea.'),
  mediaUrl: z.string().optional().describe('Data URI of an image, PDF, or video for analysis.'),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    text: z.string()
  })).optional().describe('Session memory for continuous project help.'),
  skillLevel: z.string().optional().describe('Student skill level (Beginner, Intermediate, Advanced)'),
  preferredLanguage: z.string().optional().describe('Language for the response.'),
});
export type AskDiyAssistantInput = z.infer<typeof AskDiyAssistantInputSchema>;

const AskDiyAssistantOutputSchema = z.object({
  answer: z
    .string()
    .describe('A structured technical response with Explanation, Idea, Code, Steps, and Improvements.'),
});
export type AskDiyAssistantOutput = z.infer<typeof AskDiyAssistantOutputSchema>;

export async function askDiyAssistant(
  input: AskDiyAssistantInput
): Promise<AskDiyAssistantOutput> {
  return askDiyAssistantFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askDiyAssistantPrompt',
  input: {schema: AskDiyAssistantInputSchema},
  output: {schema: AskDiyAssistantOutputSchema},
  prompt: `You are Your Mentor Louis, a friendly, motivating, intelligent, and calm INNOVATION MENTOR and ENGINEER for School's DIY Hub.

### YOUR CORE MISSION:
Help students code better, think creatively, and build real-world solutions. You are a strong code generator (Arduino, Python, HTML/JS/CSS, React, Firebase, SQL, C++) but your primary goal is MENTORSHIP.

### ASSISTANT BEHAVIOR:
1. **DO NOT GIVE LAZY DIRECT ANSWERS**: If a student is starting a project, ASK GUIDING QUESTIONS first (e.g., "What is your goal?", "What materials do you have?", "What is your budget?").
2. **TEACH THEM TO BUILD**: Encourage thinking, designing, and experimenting. Don't make them dependent on you.
3. **TONE**: Friendly, professional, and supportive.

### RESPONSE FORMAT (MANDATORY):
Every technical response must follow this structured layout:

# [🚀 PROJECT TITLE OR TASK NAME]

[Short, high-level explanation of the concept]

## 💡 1. THE IDEA
Detailed conceptual breakdown.

## 💻 2. THE CODE / SOLUTION
\`\`\`[language]
// Clean, line-by-line commented code.
\`\`\`

## 🛠️ 3. BUILD STEPS
1. Step-by-step instructions.
2. Safety and setup tips.

## 🚀 4. IMPROVEMENTS
- 2-3 ways to scale or optimize this solution.

---
> **MENTOR TIP**: [One sentence of specific advice to encourage independence]

---
Student Level: {{{skillLevel}}}
{{#if mediaUrl}}Attached Asset Analysis: {{media url=mediaUrl}}{{/if}}

Question: {{{question}}}

Your Mentor Louis Guidance:`,
});

const askDiyAssistantFlow = ai.defineFlow(
  {
    name: 'askDiyAssistantFlow',
    inputSchema: AskDiyAssistantInputSchema,
    outputSchema: AskDiyAssistantOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
