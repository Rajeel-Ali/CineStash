

'use client'

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { CineItem } from '@/app/lib/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovieCard } from '@/components/movie-card';
import { PageHeader } from '@/components/page-header';
import { getPopular } from '@/ai/flows/get-popular-movies';
import { searchTMDB } from '@/app/lib/tmdb';
import { useDebounce } from '@/hooks/use-debounce';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useUserLibrary } from '@/hooks/use-user-library';
import { Input } from '@/components/ui/input';

const getStoredItems = (key: string): CineItem[] => {
  if (typeof window === 'undefined') return [];
  const stored = localStorage.getItem(key);
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
};

const setStoredItems = (key: string, items: CineItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(items));
};

const getStoredPage = (key: string): number => {
    if (typeof window === 'undefined') return 1;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 1;
}

const setStoredPage = (key: string, page: number) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, page.toString());
}

export default function DiscoverPage() {
  const [popularMovies, setPopularMovies] = useState<CineItem[]>(() => getStoredItems('discover_popularMovies'));
  const [popularShows, setPopularShows] = useState<CineItem[]>(() => getStoredItems('discover_popularShows'));
  const [moviePage, setMoviePage] = useState(() => getStoredPage('discover_moviePage'));
  const [showPage, setShowPage] = useState(() => getStoredPage('discover_showPage'));

  const [isLoadingMovies, setIsLoadingMovies] = useState(false);
  const [isLoadingShows, setIsLoadingShows] = useState(false);

  const [isLoadingMoreMovies, setIsLoadingMoreMovies] = useState(false);
  const [isLoadingMoreShows, setIsLoadingMoreShows] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [tmdbResults, setTmdbResults] = useState<CineItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const { toast } = useToast();
  const { library, isLoading: isLibraryLoading } = useUserLibrary();
  const libraryTmdbIds = useMemo(() => new Set(library.map(item => item.tmdbId)), [library]);

  useEffect(() => {
    setStoredItems('discover_popularMovies', popularMovies);
  }, [popularMovies]);

  useEffect(() => {
    setStoredItems('discover_popularShows', popularShows);
  }, [popularShows]);

  useEffect(() => {
    setStoredPage('discover_moviePage', moviePage);
  }, [moviePage]);
  
  useEffect(() => {
    setStoredPage('discover_showPage', showPage);
  }, [showPage]);

  useEffect(() => {
    const performSearch = async () => {
      if (debouncedSearchQuery) {
        setIsSearching(true);
        setTmdbResults([]);
        try {
          const onlineResults = await searchTMDB(debouncedSearchQuery);
          const filteredResults = onlineResults.filter(item => !libraryTmdbIds.has(item.tmdbId));
          setTmdbResults(filteredResults);
        } catch (error) {
           console.error("Search failed:", error);
           toast({ title: "Error", description: "Could not perform search.", variant: "destructive" });
        } finally {
          setIsSearching(false);
        }
      } else {
        setTmdbResults([]);
      }
    };

    if (!isLibraryLoading) {
        performSearch();
    }
  }, [debouncedSearchQuery, libraryTmdbIds, isLibraryLoading, toast]);


  const fetchInitialData = useCallback(async (type: 'movie' | 'show') => {
    if (type === 'movie') {
      if (popularMovies.length > 0) return;
      setIsLoadingMovies(true);
    } else {
      if (popularShows.length > 0) return;
      setIsLoadingShows(true);
    }

    try {
      const result = await getPopular(1);
      const movies = result.movies;
      const shows = result.shows;
      
      const newMovies = movies.filter(item => !libraryTmdbIds.has(item.tmdbId));
      const newShows = shows.filter(item => !libraryTmdbIds.has(item.tmdbId));
      
      if (type === 'movie') {
        setPopularMovies(newMovies);
        setMoviePage(1);
      } else {
        setPopularShows(newShows);
        setShowPage(1);
      }

    } catch (error) {
      console.error(`Failed to fetch popular ${type}s`, error);
      toast({ title: "Error", description: `Could not load popular ${type}s.`, variant: "destructive" });
    } finally {
      if (type === 'movie') setIsLoadingMovies(false);
      else setIsLoadingShows(false);
    }
  }, [libraryTmdbIds, toast, popularMovies.length, popularShows.length]);

  useEffect(() => {
    if (!isLibraryLoading) {
        if(popularMovies.length === 0){
            fetchInitialData('movie');
        }
    }
  }, [isLibraryLoading, fetchInitialData, popularMovies.length]);

  const handleTabChange = async (value: string) => {
    if (value === 'shows' && popularShows.length === 0) {
      await fetchInitialData('show');
    } else if (value === 'movies' && popularMovies.length === 0) {
      await fetchInitialData('movie');
    }
  }


  const fetchMore = async (type: 'movie' | 'show') => {
    const pageToFetch = type === 'movie' ? moviePage + 1 : showPage + 1;
    if (type === 'movie') setIsLoadingMoreMovies(true);
    else setIsLoadingMoreShows(true);

    try {
        const result = await getPopular(pageToFetch);
        const items = type === 'movie' ? result.movies : result.shows;
        
        const newItems = items.filter(item => !libraryTmdbIds.has(item.tmdbId));

        if (type === 'movie') {
            setPopularMovies(prev => {
                const existingIds = new Set(prev.map(m => m.tmdbId));
                const uniqueNew = newItems.filter(m => !existingIds.has(m.tmdbId));
                return [...prev, ...uniqueNew];
            });
            setMoviePage(pageToFetch);
        } else {
             setPopularShows(prev => {
                const existingIds = new Set(prev.map(s => s.tmdbId));
                const uniqueNew = newItems.filter(s => !existingIds.has(s.tmdbId));
                return [...prev, ...uniqueNew];
            });
            setShowPage(pageToFetch);
        }
    } catch(error) {
        console.error(`Failed to fetch more ${type}s`, error);
        toast({ title: "Error", description: `Could not load more ${type}s.`, variant: "destructive" });
    } finally {
        if (type === 'movie') setIsLoadingMoreMovies(false);
        else setIsLoadingMoreShows(false);
    }
  }

  const renderSearchResults = () => (
    <div>
        <h2 className="text-xl font-bold mb-6 mt-12">
            Search Results for "{debouncedSearchQuery}"
        </h2>
        {isSearching ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-[375px] w-full rounded-lg" />)}
          </div>
        ) : tmdbResults.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8">
            {tmdbResults.map(item => (
              <MovieCard key={item.tmdbId} item={item} isOnlineResult={true} />
            ))}
          </div>
        ) : !isSearching && debouncedSearchQuery ? (
          <div className="text-center py-10 text-muted-foreground">
            <p>No new movies or shows found for "{debouncedSearchQuery}".</p>
          </div>
        ) : null}
    </div>
  );

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader title="Discover" description="Find your next favorite movie or show." />
      
       <div className="mt-8 max-w-2xl mx-auto">
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search for titles, actors, genres..."
            className="w-full pl-10 h-12 text-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {debouncedSearchQuery ? renderSearchResults() : (
        <Tabs defaultValue="movies" className="mt-8" onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="movies">Popular Movies</TabsTrigger>
            <TabsTrigger value="shows">Popular Shows</TabsTrigger>
            </TabsList>
            
            <TabsContent value="movies">
            {isLoadingMovies && popularMovies.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
                    {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-[375px] w-full rounded-lg" />)}
                </div>
            ) : popularMovies.length > 0 ? (
                <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
                    {popularMovies.map(item => (
                      <MovieCard key={item.tmdbId} item={item} isOnlineResult={true} />
                    ))}
                </div>
                <div className="flex justify-center mt-8">
                    <Button onClick={() => fetchMore('movie')} disabled={isLoadingMoreMovies}>
                        {isLoadingMoreMovies && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Load More Movies
                    </Button>
                </div>
                </>
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                <p>Could not load popular movies.</p>
                </div>
            )}
            </TabsContent>
            
            <TabsContent value="shows">
            {isLoadingShows && popularShows.length === 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
                    {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-[375px] w-full rounded-lg" />)}
                </div>
            ) : popularShows.length > 0 ? (
                <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
                    {popularShows.map(item => (
                        <MovieCard key={item.tmdbId} item={item} isOnlineResult={true} />
                    ))}
                    </div>
                    <div className="flex justify-center mt-8">
                        <Button onClick={() => fetchMore('show')} disabled={isLoadingMoreShows}>
                            {isLoadingMoreShows && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Load More Shows
                        </Button>
                    </div>
                </>
            ) : (
                <div className="text-center py-20 text-muted-foreground">
                    <p>Could not load popular shows.</p>
                </div>
            )}
            </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

    