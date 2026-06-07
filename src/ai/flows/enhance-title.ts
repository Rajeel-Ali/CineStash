
'use server';

/**
 * @fileOverview A flow to enhance a movie title using GenAI if the original title is truncated or incorrect.
 *
 * - enhanceTitle - A function that enhances the title of a movie.
 * - EnhanceTitleInput - The input type for the enhanceTitle function.
 * - EnhanceTitleOutput - The return type for the enhanceTitle function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceTitleInputSchema = z.object({
  title: z.string().describe('The title of the movie, which might be truncated or incorrect.'),
});
export type EnhanceTitleInput = z.infer<typeof EnhanceTitleInputSchema>;

const EnhanceTitleOutputSchema = z.object({
  enhancedTitle: z.string().describe('The corrected, full title of the movie.'),
});
export type EnhanceTitleOutput = z
  .infer<typeof EnhanceTitleOutputSchema>;

export async function enhanceTitle(input: EnhanceTitleInput): Promise<EnhanceTitleOutput> {
  return enhanceTitleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceTitlePrompt',
  input: {schema: EnhanceTitleInputSchema},
  output: {schema: EnhanceTitleOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a movie title expert. Given a movie title that might be truncated or misspelled, determine the most likely full, correct movie title.

Title: {{{title}}}

Corrected Title: `,
});

const enhanceTitleFlow = ai.defineFlow(
  {
    name: 'enhanceTitleFlow',
    inputSchema: EnhanceTitleInputSchema,
    outputSchema: EnhanceTitleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
