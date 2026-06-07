'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { CineItem } from '@/app/lib/types';
import { useUserLibrary } from '@/hooks/use-user-library';
import { MovieCard } from '@/components/movie-card';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

export default function LibraryPage() {
  const router = useRouter();
  const { library, isLoading } = useUserLibrary();

  const watchedItems = library.filter(item => item.status === 'Watched');
  const toWatchItems = library.filter(item => item.status === 'To Watch');
  const startedItems = library.filter(item => item.status === 'Started');

  const renderGrid = (items: CineItem[], emptyMessage: string) => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
          {[...Array(12)].map((_, i) => <Skeleton key={i} className="h-[375px] w-full rounded-lg" />)}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-24 px-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-8 max-w-sm w-full">
            <span className="text-5xl block mb-4">📭</span>
            <h3 className="text-lg font-semibold text-foreground mb-1">No titles in this list yet.</h3>
            <p className="text-sm text-muted-foreground mb-6">{emptyMessage}</p>
            <Button onClick={() => router.push('/discover')} className="w-full">
              Find something to watch →
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-8 mt-6">
        {items.map(item => (
          <MovieCard key={item.id} item={item} />
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader title="Your Library" description="All your saved movies and shows." />

      <Tabs defaultValue="towatch" className="mt-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="towatch">To Watch ({toWatchItems.length})</TabsTrigger>
          <TabsTrigger value="started">Started ({startedItems.length})</TabsTrigger>
          <TabsTrigger value="watched">Watched ({watchedItems.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="towatch">
          {renderGrid(toWatchItems, "Your 'To Watch' list is empty.")}
        </TabsContent>
        <TabsContent value="started">
          {renderGrid(startedItems, "You haven't started watching anything yet.")}
        </TabsContent>
        <TabsContent value="watched">
          {renderGrid(watchedItems, "You haven't marked any items as watched yet.")}
        </TabsContent>
      </Tabs>
    </div>
  );
}
