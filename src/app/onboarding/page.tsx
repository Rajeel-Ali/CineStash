
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { CineItem } from '@/app/lib/types';
import { getPopular } from '@/ai/flows/get-popular-movies';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MovieCard } from '@/components/movie-card';
import { Checkbox } from '@/components/ui/checkbox';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase';

const ONBOARDING_MIN_SELECTIONS = 5;

// Simple shuffle function
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [items, setItems] = useState<CineItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const [page, setPage] = useState(1);

  const fetchItems = useCallback(async (pageToFetch: number) => {
    if (pageToFetch === 1) {
        setIsLoading(true);
    } else {
        setIsLoadingMore(true);
    }

    try {
      const result = await getPopular(pageToFetch);
      const combined = shuffleArray([...result.movies, ...result.shows]);

      setItems(prev => {
        const existingIds = new Set(prev.map(i => i.tmdbId));
        const newItems = combined.filter(i => !existingIds.has(i.tmdbId));
        return [...prev, ...newItems];
      });
      setPage(pageToFetch);

    } catch (error) {
      console.error('Failed to fetch popular items:', error);
      toast({
        title: 'Error fetching items',
        description: 'Could not load suggestions. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [toast]);
  
  useEffect(() => {
    if (items.length === 0) {
        fetchItems(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleSelectItem = (tmdbId: number) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tmdbId)) {
        newSet.delete(tmdbId);
      } else {
        newSet.add(tmdbId);
      }
      return newSet;
    });
  };

  const finishOnboarding = () => {
    if (selectedItems.size < ONBOARDING_MIN_SELECTIONS) {
      toast({
        title: `Select at least ${ONBOARDING_MIN_SELECTIONS} movies or shows`,
        description: `Please select a few more you've watched to get personalized recommendations.`,
        variant: 'default',
      });
      return;
    }
    
    setIsFinishing(true);
    const watchedItems = items.filter(item => selectedItems.has(item.tmdbId));
    
    const library = watchedItems.map(item => ({
      ...item,
      id: crypto.randomUUID(),
      status: 'Watched' as const,
      dateWatched: new Date().toISOString(),
      dateAdded: new Date().toISOString(),
    }));

    localStorage.setItem('cineStashLibrary', JSON.stringify(library));
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('showSwipeTutorial', 'true');
    
    toast({
      title: 'Welcome to CineStash!',
      description: 'Your library has been created.',
    });

    router.push('/');
  };

  const skipOnboarding = () => {
    localStorage.setItem('cineStashLibrary', JSON.stringify([]));
    localStorage.setItem('onboardingComplete', 'true');
    localStorage.setItem('showSwipeTutorial', 'true');
    router.push('/');
  };

  const progress = Math.min(100, (selectedItems.size / ONBOARDING_MIN_SELECTIONS) * 100);
  const canFinish = selectedItems.size >= ONBOARDING_MIN_SELECTIONS;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Getting things ready...</p>
      </div>
    );
  }
  
  return (
    <FirebaseClientProvider>
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 pb-32">
      <header className="text-center">
        <h1 className="text-3xl font-headline font-bold tracking-tight">Welcome to CineStash</h1>
        <p className="text-muted-foreground mt-2">Select movies and shows you've already watched to build your initial library.</p>
        <div className="my-6 max-w-md mx-auto">
           <Progress value={progress} />
           <p className="text-sm text-muted-foreground text-center mt-2">{selectedItems.size} of {ONBOARDING_MIN_SELECTIONS} minimum selected</p>
        </div>
      </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
            {items.map(item => (
            <div key={item.tmdbId} className="relative cursor-pointer" onClick={() => handleSelectItem(item.tmdbId)}>
                <MovieCard item={item} disableActions={true} />
                <div className="absolute top-2 right-2 z-10 bg-background/80 rounded-full p-1 pointer-events-none">
                    <Checkbox
                        checked={selectedItems.has(item.tmdbId)}
                        aria-label={`Select ${item.title}`}
                    />
                </div>
                {selectedItems.has(item.tmdbId) && (
                <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-lg pointer-events-none" />
                )}
            </div>
            ))}
        </div>

        <div className="flex justify-center mt-8">
            <Button onClick={() => fetchItems(page + 1)} disabled={isLoadingMore}>
                {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Load More
            </Button>
        </div>
     
      <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-sm border-t p-4 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button onClick={finishOnboarding} size="lg" disabled={!canFinish || isFinishing}>
          {isFinishing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Finish Onboarding
        </Button>
        <Button onClick={skipOnboarding} size="lg" variant="ghost">
          Skip for Now
        </Button>
      </footer>
    </div>
    <Toaster />
    </FirebaseClientProvider>
  );
}
