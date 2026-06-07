
'use client';

import { useToast } from '@/hooks/use-toast';
import type { CineItem, Status } from '@/app/lib/types';

type AddToLibraryOptions = {
  silent?: boolean;
};

type LibraryManagerOptions = {
  silent?: boolean;
}

export function useLibraryManager() {
  const { toast } = useToast();

  const getLibrary = (): CineItem[] => {
    if (typeof window === 'undefined') return [];
    const libraryString = localStorage.getItem('cineStashLibrary');
    return libraryString ? JSON.parse(libraryString) : [];
  };

  const saveLibrary = (library: CineItem[]) => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('cineStashLibrary', JSON.stringify(library));
    window.dispatchEvent(new Event('storage'));
  };

  const addToLibrary = (item: CineItem, status: Status, options: AddToLibraryOptions = {}) => {
    const library = getLibrary();

    if (library.some(libItem => libItem.tmdbId === item.tmdbId)) {
      if (!options.silent) {
        toast({
          title: 'Already in library',
          description: `${item.title} is already in your library.`,
        });
      }
      return;
    }

    const newItem: CineItem = { ...item, id: crypto.randomUUID(), status, dateAdded: new Date().toISOString() };
    if (status === 'Watched') {
      newItem.dateWatched = new Date().toISOString();
    }
    
    library.unshift(newItem);
    saveLibrary(library);

    if (!options.silent) {
      toast({
        title: 'Added to Library!',
        description: `${item.title} was added to your "${status}" list.`,
      });
    }
  };

  const updateItemStatus = (itemId: string, newStatus: Status, options: LibraryManagerOptions = {}) => {
    const library = getLibrary();
    let itemTitle = '';
    const updatedLibrary = library.map(item => {
      if (item.id === itemId) {
        itemTitle = item.title;
        const updatedItem = { ...item, status: newStatus };
        if (newStatus === 'Watched' && !item.dateWatched) {
            updatedItem.dateWatched = new Date().toISOString();
        }
        return updatedItem;
      }
      return item;
    });

    if(itemTitle){
        saveLibrary(updatedLibrary);
        if (!options.silent) {
          toast({
              title: `Moved to "${newStatus}"`,
              description: `${itemTitle} has been updated.`,
          });
        }
    }
  };

  const removeFromLibrary = (itemId: string, options: LibraryManagerOptions = {}) => {
    const library = getLibrary();
    const itemToRemove = library.find(item => item.id === itemId);

    if (itemToRemove) {
      const updatedLibrary = library.filter(item => item.id !== itemId);
      saveLibrary(updatedLibrary);
      if (!options.silent) {
        toast({
          title: 'Removed from Library',
          description: `${itemToRemove.title} has been removed.`,
        });
      }
    }
  };

  return { addToLibrary, updateItemStatus, removeFromLibrary };
}
