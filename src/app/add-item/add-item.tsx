
'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { getTMDBDetails } from '@/app/lib/tmdb';
import type { CineItem, CineItemType } from '@/app/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useLibraryManager } from '@/hooks/use-library-manager';

export default function AddItem() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tmdbId = searchParams.get('tmdbId');
  const type = searchParams.get('type') as CineItemType;
  
  const [item, setItem] = useState<CineItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToLibrary } = useLibraryManager();

  const handleNavigation = useCallback(() => {
    // Check if there is a history to go back to
    if (window.history.length > 1) {
      router.back();
    } else {
      // If no history, redirect to a default page (e.g., home or discover)
      router.push('/discover');
    }
  },[router]);

  useEffect(() => {
    if (tmdbId && type) {
      const fetchDetails = async () => {
        setIsLoading(true);
        const details = await getTMDBDetails(parseInt(tmdbId), type);
        setItem(details);
        setIsLoading(false);
      };
      fetchDetails();
    } else {
        handleNavigation();
    }
  }, [tmdbId, type, handleNavigation]);

  const handleAddToLibrary = () => {
    if (!item) return;
    addToLibrary(item, 'To Watch');
    handleNavigation();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-16 w-16 animate-spin" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Could not find details for this item.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle>Add to Your Library?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex gap-6">
                <div className="w-1/3 flex-shrink-0">
                    <Image
                    src={item.posterId ? `https://image.tmdb.org/t/p/w500${item.posterId}` : 'https://placehold.co/500x750/242429/FFFFFF/png?text=No+Image'}
                    alt={`Poster for ${item.title}`}
                    width={200}
                    height={300}
                    className="rounded-lg w-full h-auto object-cover"
                    />
                </div>
                <div className="w-2/3 space-y-2">
                    <h2 className="text-2xl font-bold">{item.title}</h2>
                    <p className="text-muted-foreground">{item.year}</p>
                    <p className="text-sm line-clamp-6">{item.synopsis}</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleAddToLibrary} className="flex-1">Add to "To Watch"</Button>
                <Button onClick={handleNavigation} variant="outline" className="flex-1">Cancel</Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
