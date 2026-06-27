
import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {openai} from 'genkitx-openai';

/**
 * @fileOverview Genkit Configuration Hub.
 * DeepSeek is integrated via the OpenAI-compatible protocol for high-performance mentorship.
 * Your specific API key sk-0baa... is now active as the core intelligence provider.
 */

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: process.env.GEMINI_API_KEY,
    }),
    openai({
      apiKey: 'sk-0baa76eb737d4f0296af0fc8075af9e0',
      configuration: {
        baseURL: 'https://api.deepseek.com',
      },
    }),
  ],
  model: 'openai/deepseek-chat',
});
