
'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating initial movie/show suggestions based on a user-provided prompt.
 *
 * - generateInitialSuggestions - A function that takes a user prompt and returns a list of movie/show suggestions.
 * - GenerateInitialSuggestionsInput - The input type for the generateInitialSuggestions function.
 * - GenerateInitialSuggestionsOutput - The return type for the generateInitialSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateInitialSuggestionsInputSchema = z.object({
  prompt: z
    .string()
    .describe(
      'A prompt describing the type of movies or shows the user is interested in.'
    ),
});

export type GenerateInitialSuggestionsInput = z.infer<
  typeof GenerateInitialSuggestionsInputSchema
>;

const GenerateInitialSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe(
      'A list of movie/show suggestions based on the user-provided prompt.'
    ),
});

export type GenerateInitialSuggestionsOutput = z.infer<
  typeof GenerateInitialSuggestionsOutputSchema
>;

export async function generateInitialSuggestions(
  input: GenerateInitialSuggestionsInput
): Promise<GenerateInitialSuggestionsOutput> {
  return generateInitialSuggestionsFlow(input);
}

const generateInitialSuggestionsPrompt = ai.definePrompt({
  name: 'generateInitialSuggestionsPrompt',
  input: {schema: GenerateInitialSuggestionsInputSchema},
  output: {schema: GenerateInitialSuggestionsOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are a movie and TV show expert. Based on the user's prompt, generate a list of movie/show suggestions.

  Prompt: {{{prompt}}}

  Suggestions:`,
});

const generateInitialSuggestionsFlow = ai.defineFlow(
  {
    name: 'generateInitialSuggestionsFlow',
    inputSchema: GenerateInitialSuggestionsInputSchema,
    outputSchema: GenerateInitialSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await generateInitialSuggestionsPrompt(input);
    return output!;
  }
);
