
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { CineItem, Status } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { Loader2, X, Check, Undo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { TinderLikeCard } from '@/components/tinder-card';
import { getPopular } from '@/ai/flows/get-popular-movies';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from 'next/image';
import { useUserLibrary } from '@/hooks/use-user-library';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLibraryManager } from '@/hooks/use-library-manager';
import { TutorialDialog } from '@/components/tutorial-dialog';

const PRELOAD_THRESHOLD = 3;
const MAX_RECURSIVE_FETCHES = 5;

const getStoredSwipedItems = (key: string): Set<number> => {
  if (typeof window === 'undefined') return new Set();
  const stored = localStorage.getItem(key);
  try {
    const parsed = stored ? JSON.parse(stored) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch (e) {
    return new Set();
  }
};

const setStoredSwipedItems = (key: string, swiped: Set<number>) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(Array.from(swiped)));
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

export default function HomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { addToLibrary, removeFromLibrary } = useLibraryManager();
  
  const [movies, setMovies] = useState<CineItem[]>([]);
  const [shows, setShows] = useState<CineItem[]>([]);
  
  const [moviePage, setMoviePage] = useState(() => getStoredPage('moviePage'));
  const [showPage, setShowPage] = useState(() => getStoredPage('showPage'));

  const [isMovieLoading, setIsMovieLoading] = useState(true);
  const [isShowLoading, setIsShowLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState<'movies' | 'shows'>('movies');

  const [lastAction, setLastAction] = useState<{ item: CineItem, status: Status } | null>(null);

  const [isOptionsDialogOpen, setIsOptionsDialogOpen] = useState(false);
  const [selectedItemForOptions, setSelectedItemForOptions] = useState<CineItem | null>(null);

  const { library, isLoading: isLibraryLoading } = useUserLibrary();
  const libraryTmdbIds = useMemo(() => new Set(library.map(item => item.tmdbId)), [library]);

  const swipedItemsKey = useMemo(() => `swipedItems_${activeTab}`, [activeTab]);
  const [swipedItems, setSwipedItems] = useState<Set<number>>(() => getStoredSwipedItems(swipedItemsKey));
  
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldShow = localStorage.getItem('showSwipeTutorial') === 'true';
      if (shouldShow) {
        setShowTutorial(true);
        localStorage.removeItem('showSwipeTutorial');
      }
    }
  }, []);
  
  const fetchItems = useCallback(async (page: number): Promise<void> => {
    setIsLoadingMore(true);

    let newItemsFound = false;
    let attempts = 0;
    let currentPage = page;

    while (!newItemsFound && attempts < MAX_RECURSIVE_FETCHES) {
      try {
        const result = await getPopular(currentPage);
        let items = activeTab === 'movies' ? result.movies : result.shows;
        items = items.filter(item => !item.genres.includes('Animation'));
        
        const currentItemsList = activeTab === 'movies' ? movies : shows;
        
        const allSeenIds = new Set([...libraryTmdbIds, ...swipedItems, ...currentItemsList.map(i => i.tmdbId)]);
        const newItems = items.filter(item => !allSeenIds.has(item.tmdbId));
        
        if (newItems.length > 0) {
            const itemsSetter = activeTab === 'movies' ? setMovies : setShows;
            const pageSetter = activeTab === 'movies' ? setMoviePage : setShowPage;
            const pageKey = activeTab === 'movies' ? 'moviePage' : 'showPage';
            
            itemsSetter(prevItems => [...prevItems, ...newItems]);
            pageSetter(currentPage);
            setStoredPage(pageKey, currentPage);
            newItemsFound = true;
        } else if (items.length > 0) {
            currentPage++;
            attempts++;
        } else {
            break; 
        }
      } catch (error) {
        console.error(`Failed to fetch popular ${activeTab}`, error);
        toast({ title: "Error", description: `Could not load popular ${activeTab}.`, variant: "destructive" });
        break;
      }
    }

    if (!newItemsFound && attempts >= MAX_RECURSIVE_FETCHES) {
        toast({ title: "Could not find more titles", description: "You might be all caught up for now. Please try again later.", variant: "default" });
    }

    setIsLoadingMore(false);
    if (activeTab === 'movies') setIsMovieLoading(false);
    else setIsShowLoading(false);

  }, [toast, libraryTmdbIds, activeTab, movies, shows, swipedItems]);
  
  useEffect(() => {
    if (!isLibraryLoading && activeTab === 'movies' && movies.length === 0) {
        setIsMovieLoading(true);
        fetchItems(moviePage);
    }
  }, [isLibraryLoading, activeTab, movies.length, fetchItems, moviePage]);

  useEffect(() => {
    if (!isLibraryLoading && activeTab === 'shows' && shows.length === 0) {
      setIsShowLoading(true);
      fetchItems(showPage);
    }
  }, [isLibraryLoading, activeTab, shows.length, fetchItems, showPage]);


  const handleTabChange = (value: string) => {
    const tab = value as 'movies' | 'shows';
    setActiveTab(tab);
    setLastAction(null);
    const newSwipedKey = `swipedItems_${tab}`;
    setSwipedItems(getStoredSwipedItems(newSwipedKey));

    if (tab === 'shows' && shows.length === 0) {
        setIsShowLoading(true);
        fetchItems(showPage);
    } else if (tab === 'movies' && movies.length === 0) {
        setIsMovieLoading(true);
        fetchItems(moviePage);
    }
  }

  const currentItems = useMemo(() => activeTab === 'movies' ? movies : shows, [activeTab, movies, shows]);
  const visibleItems = useMemo(() => currentItems.filter(item => !swipedItems.has(item.tmdbId)), [currentItems, swipedItems]);
  
  const updateSwipedState = (tmdbId: number) => {
    setSwipedItems(prev => {
        const newSet = new Set(prev).add(tmdbId);
        setStoredSwipedItems(swipedItemsKey, newSet);
        return newSet;
    });
  }

  const handleSwipe = (direction: 'left' | 'right', item: CineItem) => {
    if (!item) return;
    
    updateSwipedState(item.tmdbId);
    
    const status: Status = direction === 'right' ? 'Watched' : 'Not Interested';

    if (direction === 'left') { 
      if (!isMobile) {
        toast({ title: 'Skipped' });
      }
    } else { // Right swipe
      addToLibrary(item, 'Watched');
      if (!isMobile) {
        toast({ title: 'Added to Watched' });
      }
    }

    setLastAction({ item, status });
  };

  const undoLastAction = () => {
      if (!lastAction) return;
      const { item, status } = lastAction;

      // If the item was added to the library, remove it
      if (status !== 'Not Interested') {
        const libraryItem = library.find(i => i.tmdbId === item.tmdbId);
        if (libraryItem) {
          removeFromLibrary(libraryItem.id, { silent: true });
        }
      }
      
      // Remove from the swiped set so it can reappear
      setSwipedItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(item.tmdbId);
          setStoredSwipedItems(swipedItemsKey, newSet);
          return newSet;
      });

      toast({
          title: 'Undo Successful',
          description: `${item.title} has been restored.`,
      });

      setLastAction(null);
  };
  
  useEffect(() => {
    if (!isOptionsDialogOpen) {
      setSelectedItemForOptions(null);
    }
  }, [isOptionsDialogOpen]);

  const handleHold = (item: CineItem) => {
    setSelectedItemForOptions(item);
    setIsOptionsDialogOpen(true);
  };

  const handleOptionSelect = (status: Status) => {
    if (!selectedItemForOptions) return;
    
    addToLibrary(selectedItemForOptions, status);
    
    updateSwipedState(selectedItemForOptions.tmdbId);
    setLastAction({ item: selectedItemForOptions, status });

    setIsOptionsDialogOpen(false);
  };

  useEffect(() => {
    if (visibleItems.length > 0 && visibleItems.length <= PRELOAD_THRESHOLD && !isLoadingMore) {
      const pageToFetch = activeTab === 'movies' ? moviePage + 1 : showPage + 1;
      fetchItems(pageToFetch);
    }
  }, [visibleItems.length, isLoadingMore, activeTab, fetchItems, moviePage, showPage]);


  const renderContent = () => {
    const itemsToRender = visibleItems.slice(0, 5);

    const handleLoadMore = () => {
        const pageToFetch = activeTab === 'movies' ? moviePage + 1 : showPage + 1;
        fetchItems(pageToFetch);
    }

    return (
        <>
            <div className="relative w-full max-w-sm h-[70vh] max-h-[550px]">
                {itemsToRender.length > 0 ? (
                    itemsToRender.map((item, index) => {
                    const isTop = index === 0;
                    return (
                    <TinderLikeCard
                        key={item.tmdbId}
                        item={item}
                        onSwipe={(dir) => handleSwipe(dir, item)}
                        onHold={() => handleHold(item)}
                        isTopCard={isTop}
                        cardIndex={index}
                        totalCards={itemsToRender.length}
                    />
                    )
                })
                ) : !isMovieLoading && !isShowLoading ? (
                    <div className="text-center bg-card rounded-xl shadow-lg p-8 flex flex-col items-center justify-center h-full">
                        <h2 className="text-xl font-bold">All Caught Up!</h2>
                        <p className="text-muted-foreground mt-2">Check back later for new titles.</p>
                        <Button onClick={handleLoadMore} disabled={isLoadingMore} className="mt-4">
                            {isLoadingMore && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Load More
                        </Button>
                    </div>
                ): (
                  <div className="flex flex-col justify-center items-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Finding new titles...</p>
                  </div>
                )}
            </div>

            <footer className="flex-shrink-0 flex flex-col items-center space-y-4 pt-4 w-full max-w-sm">
              <div className="flex items-center justify-center space-x-4">
                  <Button variant="outline" size="icon" className="w-16 h-16 rounded-full bg-card/80 shadow-lg border-2 border-transparent transition-all duration-200 hover:bg-red-950/30 hover:border-red-500 hover:shadow-red-500/20 hover:shadow-xl" onClick={() => visibleItems.length > 0 && handleSwipe('left', visibleItems[0])} disabled={visibleItems.length === 0}>
                      <X className="w-8 h-8 text-destructive" />
                  </Button>
                   <Button variant="outline" size="icon" className="w-12 h-12 rounded-full bg-card/80 shadow-lg border-2 border-transparent transition-all duration-200 hover:bg-zinc-800/50 hover:border-zinc-500" onClick={undoLastAction} disabled={!lastAction}>
                      <Undo className="w-6 h-6" />
                  </Button>
                  <Button variant="outline" size="icon" className="w-16 h-16 rounded-full bg-card/80 shadow-lg border-2 border-transparent transition-all duration-200 hover:bg-emerald-950/30 hover:border-emerald-500 hover:shadow-emerald-500/20 hover:shadow-xl" onClick={() => visibleItems.length > 0 && handleSwipe('right', visibleItems[0])} disabled={visibleItems.length === 0}>
                      <Check className="w-8 h-8 text-green-500" />
                  </Button>
              </div>
              <div className="text-xs text-muted-foreground grid grid-cols-2 gap-x-4 text-center pt-2 w-full px-4">
                  <div><span className="font-bold">Left:</span> Skip</div>
                  <div><span className="font-bold">Right:</span> Watched</div>
              </div>
              <div className="text-xs text-muted-foreground text-center pt-1">
                  <span className="font-bold">Hold card</span> for more options
              </div>
            </footer>
        </>
    )
  }
  
  const isOverallLoading = (isLibraryLoading || (activeTab === 'movies' && isMovieLoading) || (activeTab === 'shows' && isShowLoading));
  
  return (
    <>
    <TutorialDialog open={showTutorial} onOpenChange={setShowTutorial} />
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] bg-background overflow-hidden">
       <Tabs defaultValue="movies" className="w-full" onValueChange={handleTabChange}>
        <div className="flex justify-center pt-4">
          <TabsList>
            <TabsTrigger value="movies">Find Movies</TabsTrigger>
            <TabsTrigger value="shows">Find Shows</TabsTrigger>
          </TabsList>
        </div>
        <div className="flex-grow flex flex-col items-center justify-center relative w-full p-4 sm:p-6 lg:p-8">
            {isOverallLoading ? (
                 <div className="flex flex-col justify-center items-center h-full">
                    <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-muted-foreground">Loading new titles...</p>
                </div>
            ) : (
                <>
                <TabsContent value="movies" className="w-full h-full flex flex-col items-center justify-center m-0">
                  {renderContent()}
                </TabsContent>
                <TabsContent value="shows" className="w-full h-full flex flex-col items-center justify-center m-0">
                  {renderContent()}
                </TabsContent>
                </>
            )}
        </div>
       </Tabs>
    </div>
    <Dialog open={isOptionsDialogOpen} onOpenChange={setIsOptionsDialogOpen}>
      <DialogContent>
        <DialogHeader>
          {selectedItemForOptions && (
            <>
            <DialogTitle className="text-center mb-4">{selectedItemForOptions.title}</DialogTitle>
            <div className="flex justify-center">
              <Image 
                src={selectedItemForOptions.posterId ? `https://image.tmdb.org/t/p/w200${selectedItemForOptions.posterId}` : `https://placehold.co/200x300/242429/FFFFFF/png?text=No+Image`}
                alt={`Poster for ${selectedItemForOptions.title}`}
                width={100}
                height={150}
                className="rounded-md"
              />
            </div>
            </>
          )}
        </DialogHeader>
        <div className="flex flex-col space-y-2 pt-4">
          <Button onClick={() => handleOptionSelect('To Watch')}>Add to "To Watch"</Button>
          <Button onClick={() => handleOptionSelect('Started')}>Add to "Started"</Button>
          <Button variant="outline" onClick={() => router.push(`/add-item?tmdbId=${selectedItemForOptions?.tmdbId}&type=${selectedItemForOptions?.type}`)}>View Details</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}
