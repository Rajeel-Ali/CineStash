
'use server';
import 'server-only';
import type { CineItem, CineItemType } from './types';
import { enhanceTitle } from '@/ai/flows/enhance-title';
import { enhanceSynopsis } from '@/ai/flows/enhance-synopsis';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchWithRetry(url: string, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, { next: { revalidate: 3600 } });
            if (response.ok) {
                return response.json();
            }
            if (response.status === 429) {
                const retryAfter = response.headers.get('Retry-After');
                const wait = retryAfter ? parseInt(retryAfter) * 1000 : delay * (i + 1);
                console.log(`TMDB rate limit hit. Retrying after ${wait}ms...`);
                await new Promise(res => setTimeout(res, wait));
            } else {
                 // For other server-side errors, log it and retry
                console.error(`TMDB API error: ${response.status} on attempt ${i + 1}. Retrying...`);
                await new Promise(res => setTimeout(res, delay * (i + 1)));
            }
        } catch (error) {
            console.error(`Fetch failed on attempt ${i + 1}:`, error);
            if (i === retries - 1) throw error; // Throw on last attempt
            await new Promise(res => setTimeout(res, delay * (i + 1)));
        }
    }
    throw new Error(`Failed to fetch from TMDB after ${retries} retries.`);
}


export async function searchTMDB(query: string): Promise<CineItem[]> {
  if (!TMDB_API_KEY) {
    console.error('TMDB_API_KEY is not configured');
    return [];
  }

  if (!query) {
    return [];
  }

  let finalQuery = query;
  let results: CineItem[] = [];
  
  const genreMap = await getGenreMap();

  const performSearch = async (searchQuery: string) => {
    const url = `${TMDB_BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(searchQuery)}`;
    try {
        const data = await fetchWithRetry(url);
        const searchResults = data.results
            .filter((result: any) => (result.media_type === 'movie' || result.media_type === 'tv') && result.poster_path)
            .map((item: any) => normalizeTMDBData(item, genreMap));
        
        // Use a Set to filter out duplicates based on tmdbId
        const uniqueResults = new Map<number, CineItem>();
        searchResults.forEach((item: CineItem) => {
            if (!uniqueResults.has(item.tmdbId)) {
                uniqueResults.set(item.tmdbId, item);
            }
        });
        
        return Array.from(uniqueResults.values());

    } catch (error) {
        console.error(`Failed to search TMDB with query "${searchQuery}":`, error);
        return [];
    }
  }

  results = await performSearch(finalQuery);

  // If initial search fails, try enhancing the title with AI
  if (results.length === 0) {
    console.log(`Initial search for "${finalQuery}" failed. Trying to enhance title with AI.`);
    try {
      const { enhancedTitle } = await enhanceTitle({ title: query });
      if (enhancedTitle && enhancedTitle.toLowerCase() !== query.toLowerCase()) {
        console.log(`Retrying search with enhanced title: "${enhancedTitle}"`);
        finalQuery = enhancedTitle;
        results = await performSearch(finalQuery);
      }
    } catch(aiError) {
      console.error("AI title enhancement failed:", aiError);
    }
  }
  
  // Sort by popularity then by release date
  results.sort((a: CineItem, b: CineItem) => {
      const popularityA = a.rating ?? 0;
      const popularityB = b.rating ?? 0;
      if (popularityB > popularityA) return 1;
      if (popularityA > popularityB) return -1;
      
      const dateA = a.year;
      const dateB = b.year;
      if (dateB > dateA) return 1;
      if (dateA > dateB) return -1;

      return 0;
  });

  // Final check and enhancement for items without synopsis
  for (const item of results) {
    if (!item.synopsis) {
      console.log(`Synopsis missing for "${item.title}". Enhancing with AI.`);
      try {
        const { enhancedSynopsis } = await enhanceSynopsis({ title: item.title, year: item.year });
        item.synopsis = enhancedSynopsis;
      } catch (aiError) {
        console.error(`AI synopsis enhancement failed for "${item.title}":`, aiError);
      }
    }
  }

  return results;

}

export async function getTMDBDetails(tmdbId: number, type: CineItemType): Promise<CineItem | null> {
    if (!TMDB_API_KEY) {
        console.error('TMDB_API_KEY is not configured');
        return null;
    }

    const url = `${TMDB_BASE_URL}/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits`;

    try {
        const data = await fetchWithRetry(url);
        const genreMap = await getGenreMap();
        const item = normalizeTMDBData(data, genreMap, type);
        
        // Enhance synopsis if missing
        if (!item.synopsis) {
             console.log(`Synopsis missing for "${item.title}". Enhancing with AI.`);
            try {
                const { enhancedSynopsis } = await enhanceSynopsis({ title: item.title, year: item.year });
                item.synopsis = enhancedSynopsis;
            } catch (aiError) {
                 console.error(`AI synopsis enhancement failed for "${item.title}":`, aiError);
            }
        }
        
        return item;

    } catch (error) {
        console.error(`Failed to get TMDB details for ${type} ${tmdbId}:`, error);
        return null;
    }
}


export async function getPopularMovies(page = 1): Promise<CineItem[]> {
    return getPopularFromTMDB('movie', page);
}

export async function getPopularShows(page = 1): Promise<CineItem[]> {
    return getPopularFromTMDB('show', page);
}

export async function getPopularFromTMDB(type: 'movie' | 'show', page = 1): Promise<CineItem[]> {
    if (!TMDB_API_KEY) {
        console.error('TMDB_API_KEY is not configured');
        throw new Error('TMDB_API_KEY is not configured');
    }
    const endpoint = type === 'movie' ? 'discover/movie' : 'discover/tv';
    const dateKey = type === 'movie' ? 'primary_release_date.gte' : 'first_air_date.gte';
    
    // Genre IDs to exclude
    const excludedGenres = [
        16, // Animation
        10767 // Talk Show
    ];

    const url = `${TMDB_BASE_URL}/${endpoint}?api_key=${TMDB_API_KEY}&language=en-US&page=${page}&sort_by=popularity.desc&with_origin_country=US&with_original_language=en&without_genres=${excludedGenres.join(',')}&${dateKey}=1980-01-01`;

    try {
        const data = await fetchWithRetry(url);
        const genreMap = await getGenreMap();
        const results = data.results.map((item: any) => normalizeTMDBData(item, genreMap, type));

        // Sort by popularity score, then by release date descending
        results.sort((a, b) => {
            const popularityA = a.rating ?? 0;
            const popularityB = b.rating ?? 0;
            if (popularityB > popularityA) return 1;
            if (popularityA > popularityB) return -1;
            
            const dateA = a.year;
            const dateB = b.year;
            if (dateB > dateA) return 1;
            if (dateA > dateB) return -1;

            return 0;
        });

        return results;

    } catch (error) {
        console.error(`Failed to fetch popular ${type}s:`, error);
        throw error; // Re-throw the error to be handled by the caller
    }
}

async function getGenreMap(): Promise<Map<number, string>> {
    if (!TMDB_API_KEY) {
        throw new Error('TMDB_API_KEY is not configured');
    }
    const movieUrl = `${TMDB_BASE_URL}/genre/movie/list?api_key=${TMDB_API_KEY}`;
    const tvUrl = `${TMDB_BASE_URL}/genre/tv/list?api_key=${TMDB_API_KEY}`;

    try {
        const [movieGenres, tvGenres] = await Promise.all([
            fetchWithRetry(movieUrl),
            fetchWithRetry(tvUrl)
        ]);
        
        const genreMap = new Map<number, string>();
        movieGenres.genres.forEach((genre: { id: number; name: string }) => genreMap.set(genre.id, genre.name));
        tvGenres.genres.forEach((genre: { id: number; name: string }) => genreMap.set(genre.id, genre.name));
        return genreMap;
    } catch (error) {
        console.error('Failed to fetch genres:', error);
        return new Map<number, string>();
    }
}


function normalizeTMDBData(item: any, genreMap: Map<number, string>, forceType?: CineItemType): CineItem {
  const type = forceType || item.media_type;
  const isMovie = type === 'movie';

  const genreIds = item.genre_ids || (item.genres ? item.genres.map((g: any) => g.id) : []);

  const releaseDate = isMovie ? item.release_date : item.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : 0;

  return {
    id: item.id.toString(), // We will replace this with a local ID when added to library
    title: isMovie ? item.title : item.name,
    year: year,
    runtime: item.runtime || (isMovie && item.episode_run_time ? item.episode_run_time[0] : 0) || 0,
    genres: genreIds.map((id: number) => genreMap.get(id)).filter(Boolean) as string[],
    posterId: item.poster_path, // Just the path, not full URL
    synopsis: item.overview,
    cast: item.credits?.cast.slice(0, 10).map((c: any) => c.name) || [],
    tmdbId: item.id,
    imdbId: item.imdb_id || '',
    status: 'To Watch',
    rating: item.vote_average ? parseFloat(item.vote_average.toFixed(1)) : null,
    dateWatched: null,
    dateAdded: null,
    note: '',
    tags: [],
    type: type,
  };
}
