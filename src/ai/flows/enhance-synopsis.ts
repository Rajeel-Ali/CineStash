
'use server';

/**
 * @fileOverview A flow to enhance a movie synopsis using GenAI if the original synopsis is unavailable.
 *
 * - enhanceSynopsis - A function that enhances the synopsis of a movie.
 * - EnhanceSynopsisInput - The input type for the enhanceSynopsis function.
 * - EnhanceSynopsisOutput - The return type for the enhanceSynopsis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceSynopsisInputSchema = z.object({
  title: z.string().describe('The title of the movie.'),
  year: z.number().describe('The year the movie was released.'),
});
export type EnhanceSynopsisInput = z.infer<typeof EnhanceSynopsisInputSchema>;

const EnhanceSynopsisOutputSchema = z.object({
  enhancedSynopsis: z.string().describe('The enhanced synopsis of the movie.'),
});
export type EnhanceSynopsisOutput = z.infer<typeof EnhanceSynopsisOutputSchema>;

export async function enhanceSynopsis(input: EnhanceSynopsisInput): Promise<EnhanceSynopsisOutput> {
  return enhanceSynopsisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'enhanceSynopsisPrompt',
  input: {schema: EnhanceSynopsisInputSchema},
  output: {schema: EnhanceSynopsisOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a movie synopsis writer. Given the title and year of a movie, write a brief synopsis.

Title: {{{title}}}
Year: {{{year}}}

Synopsis: `,
});

const enhanceSynopsisFlow = ai.defineFlow(
  {
    name: 'enhanceSynopsisFlow',
    inputSchema: EnhanceSynopsisInputSchema,
    outputSchema: EnhanceSynopsisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
