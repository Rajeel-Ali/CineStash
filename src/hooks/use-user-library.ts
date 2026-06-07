'use client';

import { useState, useEffect } from 'react';
import type { CineItem } from '@/app/lib/types';

export function useUserLibrary() {
  const [library, setLibrary] = useState<CineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const libraryString = localStorage.getItem('cineStashLibrary');
    const localLibrary = libraryString ? JSON.parse(libraryString) : [];
    
    // Sort by dateAdded descending, assuming dateAdded exists
    localLibrary.sort((a: CineItem, b: CineItem) => {
        const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
        const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
        return dateB - dateA;
    });

    setLibrary(localLibrary);
    setIsLoading(false);

    const handleStorageChange = () => {
        const updatedLibraryString = localStorage.getItem('cineStashLibrary');
        const updatedLocalLibrary = updatedLibraryString ? JSON.parse(updatedLibraryString) : [];

        updatedLocalLibrary.sort((a: CineItem, b: CineItem) => {
            const dateA = a.dateAdded ? new Date(a.dateAdded).getTime() : 0;
            const dateB = b.dateAdded ? new Date(b.dateAdded).getTime() : 0;
            return dateB - dateA;
        });
        
        setLibrary(updatedLocalLibrary);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return { library, isLoading };
}
