'use client'

import { useEffect, useState } from 'react';
import Image from "next/image";
import { notFound, useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Star, Clock, Calendar, Tag, Tv, Film, StickyNote } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProgressTracker } from "@/components/progress-tracker";
import type { CineItem } from '@/app/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

export default function ItemDetailPage() {
    const params = useParams<{ id: string }>();
    const [item, setItem] = useState<CineItem | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const library = localStorage.getItem('cineStashLibrary');
        if (library) {
            const items: CineItem[] = JSON.parse(library);
            const foundItem = items.find(i => i.id === params.id);
            if (foundItem) {
                setItem(foundItem);
            }
        }
        setIsLoading(false);
    }, [params.id]);


  if (isLoading) {
    return <ItemDetailSkeleton />;
  }

  if (!item) {
    notFound();
  }

  const formatRuntime = (minutes: number) => {
    if (!minutes) return "N/A";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="w-full lg:w-1/3 flex-shrink-0">
          <Card className="overflow-hidden sticky top-8">
            <Image
              src={item.posterId ? `https://image.tmdb.org/t/p/w500${item.posterId}` : `https://image.tmdb.org/t/p/w500/placeholder.jpg`}
              alt={`Poster for ${item.title}`}
              width={500}
              height={750}
              className="w-full h-auto object-cover"
            />
          </Card>
        </div>

        <div className="w-full lg:w-2/3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary flex items-center gap-2">
              {item.type === 'movie' ? <Film className="w-4 h-4"/> : <Tv className="w-4 h-4"/>}
              <span>{item.type.charAt(0).toUpperCase() + item.type.slice(1)}</span>
            </p>
            <h1 className="text-4xl font-headline font-extrabold tracking-tight lg:text-5xl">
              {item.title}
            </h1>
            <p className="text-xl text-muted-foreground font-medium">{item.year}</p>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {item.genres.map((genre) => (
              <Badge key={genre} variant="secondary">{genre}</Badge>
            ))}
          </div>

          <Separator className="my-8" />

          <p className="text-lg leading-relaxed">{item.synopsis}</p>

          <Separator className="my-8" />

          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="flex items-start gap-3">
                            <Badge variant="outline" className="text-muted-foreground">{item.status}</Badge>
                        </div>
                        {item.rating && (
                            <div className="flex items-center gap-3">
                                <Star className="w-5 h-5 text-amber-400"/>
                                <span className="font-semibold">{item.rating} / 10</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3">
                            <Clock className="w-5 h-5 text-muted-foreground"/>
                            <span>{formatRuntime(item.runtime)}</span>
                        </div>
                        {item.dateWatched && (
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-muted-foreground"/>
                                <span>Watched on {new Date(item.dateWatched).toLocaleDateString()}</span>
                            </div>
                        )}
                    </div>
                    <div className="space-y-4">
                        {item.cast.length > 0 && (
                            <div>
                                <h4 className="font-semibold">Cast</h4>
                                <ul className="list-disc list-inside text-muted-foreground">
                                    {item.cast.map(actor => <li key={actor}>{actor}</li>)}
                                </ul>
                            </div>
                        )}

                        {item.tags && item.tags.length > 0 && (
                            <div>
                                <h4 className="font-semibold mb-2 mt-4">Tags</h4>
                                <div className="flex flex-wrap gap-2">
                                {item.tags.map((tag) => (
                                    <Badge key={tag} variant="outline"><Tag className="w-3 h-3 mr-1"/>{tag}</Badge>
                                ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {item.note && (
                    <div className="space-y-2 pt-4 border-t">
                        <h4 className="font-semibold flex items-center gap-2"><StickyNote className="w-4 h-4"/> Note</h4>
                        <p className="text-muted-foreground italic">"{item.note}"</p>
                    </div>
                )}
            </CardContent>
          </Card>
          
          {item.status !== 'To Watch' && (
            <div className="mt-8">
              <ProgressTracker item={item} />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function ItemDetailSkeleton() {
  return (
    <div className="container mx-auto max-w-5xl py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
        <div className="w-full lg:w-1/3 flex-shrink-0">
          <Skeleton className="w-[500px] h-[750px] rounded-lg" />
        </div>
        <div className="w-full lg:w-2/3 space-y-6">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-6 w-1/4" />
          <div className="flex flex-wrap gap-2 mt-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Separator className="my-8" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
          <Separator className="my-8" />
          <Card>
            <CardHeader><CardTitle>Details</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
