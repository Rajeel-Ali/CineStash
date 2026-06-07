
'use server';

/**
 * @fileOverview This file defines a Genkit flow for getting popular items from TMDB.
 *
 * - getPopularFlow - A function that returns a list of popular movies or shows.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';
import { getPopularFromTMDB } from '@/app/lib/tmdb';

const PopularInputSchema = z.object({
  page: z.number().optional().default(1),
});

const PopularOutputSchema = z.object({
  movies: z.array(z.any()),
  shows: z.array(z.any()),
});

export async function getPopular(page: number = 1): Promise<z.infer<typeof PopularOutputSchema>> {
  return getPopularFlow({ page });
}

const getPopularFlow = ai.defineFlow(
  {
    name: 'getPopularFlow',
    inputSchema: PopularInputSchema,
    outputSchema: PopularOutputSchema,
  },
  async ({ page }) => {
    try {
      const [movies, shows] = await Promise.all([
          getPopularFromTMDB('movie', page),
          getPopularFromTMDB('show', page)
      ]);
      return { movies, shows };
    } catch (error) {
        console.error(`getPopularFlow failed:`, error);
        // Re-throw the error to be caught by the client
        throw new Error(`Failed to fetch popular items from TMDB.`);
    }
  }
);
