
"use client";

import { useState } from "react";
import { searchTMDB } from "@/app/lib/tmdb";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Wand2, Info, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import type { CineItem } from "@/app/lib/types";
import { useLibraryManager } from "@/hooks/use-library-manager";

export type SuggestionMatch = {
  title: string;
  type: "movie" | "tv";
  vibeReason: string;
  tmdbData?: CineItem;
};

export default function SuggestionsPage() {
  const [prompt, setPrompt] = useState("");
  const [matches, setMatches] = useState<{ movie: SuggestionMatch, show: SuggestionMatch } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addToLibrary } = useLibraryManager();

  const handleGenerate = async () => {
    if (!prompt.trim() || prompt.length < 10) {
      toast({
        title: "Prompt too short",
        description: "Please provide at least 10 characters to describe your vibe.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setMatches(null);
    try {
      const url = process.env.NODE_ENV === 'development'
        ? "http://127.0.0.1:5001/studio-590336739-604d3/us-central1/vibeMatcher"
        : "https://us-central1-studio-590336739-604d3.cloudfunctions.net/vibeMatcher";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt.slice(0, 500) })
      });
      const result = await res.json();
      if (result.success) {
        const { movie, show } = result.data;
        const [movieResults, showResults] = await Promise.all([
          searchTMDB(movie.title),
          searchTMDB(show.title)
        ]);
        setMatches({
          movie: { ...movie, tmdbData: movieResults[0] },
          show: { ...show, tmdbData: showResults[0] }
        });
      } else {
        throw new Error(result.error || "Failed to generate suggestions");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error generating suggestions",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const handleAddToLibrary = async (title: string) => {
    try {
      const results = await searchTMDB(title);
      if (results.length > 0) {
        const itemToAdd = results[0];
        addToLibrary(itemToAdd, 'To Watch');
      } else {
         toast({
          title: 'Could not find item',
          description: `We couldn't find a match for "${title}" on TMDB.`,
          variant: "destructive",
        });
      }
    } catch (error) {
       toast({
        title: 'Error adding to library',
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }
  };


  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="The Vibe Matcher"
        description="Drop your exact mood, aesthetic, or scenario, and our AI agent will find your cinematic match."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-3 lg:items-start">
        <div className="lg:col-span-1 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Wand2 className="text-primary" />
                        <span>Initialize Link</span>
                    </CardTitle>
                    <CardDescription>
                    Describe your perfect cinematic vibe in detail.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Textarea
                    placeholder="e.g., 'A mind-bending sci-fi movie with a complex plot like Inception' or 'A lighthearted fantasy series'"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={4}
                    disabled={isLoading}
                    />
                    <Button onClick={handleGenerate} disabled={isLoading || prompt.length < 10} className="w-full">
                    {isLoading ? "Matching your vibe..." : "Generate Suggestions"}
                    </Button>
                </CardContent>
            </Card>

            <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Collaborative Filtering</AlertTitle>
                <AlertDescription>
                    Enable this to get suggestions based on what similar users have enjoyed. Your data remains on your device.
                </AlertDescription>
                <div className="flex items-center space-x-2 mt-4">
                    <Switch id="collaborative-filtering" />
                    <Label htmlFor="collaborative-filtering">Enable</Label>
                </div>
            </Alert>
        </div>
        
        <div className="lg:col-span-2">
            <div className="min-h-[400px]">
                <h2 className="text-2xl font-semibold tracking-tight mb-6">Your Recommendations</h2>
                {isLoading && (
                    <div className="grid gap-6 md:grid-cols-2 max-w-[1000px] mx-auto">
                        <Skeleton className="h-[500px] w-full rounded-xl" />
                        <Skeleton className="h-[500px] w-full rounded-xl" />
                    </div>
                )}
                {!isLoading && !matches && (
                    <Card className="flex flex-col items-center justify-center text-center text-muted-foreground py-16 w-full">
                        <Lightbulb className="w-16 h-16 mb-4" />
                        <p className="font-medium">Your suggestions will appear here.</p>
                    </Card>
                )}
                {matches && (
                    <div className="grid gap-6 md:grid-cols-2 max-w-[1000px] mx-auto">
                        {[matches.movie, matches.show].map((match, idx) => {
                            const item = match.tmdbData;
                            return (
                                <Card key={idx} className="flex flex-col h-full overflow-hidden border-2 bg-card">
                                  <div className="relative aspect-[2/3] w-full group">
                                     {item?.posterId ? (
                                        <img src={`https://image.tmdb.org/t/p/w500${item.posterId}`} alt={item.title || match.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                     ) : (
                                        <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">No Poster</div>
                                     )}
                                     <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white px-2 py-1 text-xs font-bold rounded shadow-sm">
                                       {item?.rating ? `⭐ ${item.rating}` : 'NR'}
                                     </div>
                                     <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm text-primary-foreground px-2 py-1 text-xs font-bold rounded uppercase shadow-sm tracking-wider">
                                       {match.type === 'movie' ? 'Movie' : 'TV Show'}
                                     </div>
                                  </div>
                                  <CardHeader className="pb-3">
                                     <CardTitle className="line-clamp-1 text-xl">{item?.title || match.title}</CardTitle>
                                     <CardDescription className="font-medium">{item?.year || 'Unknown Year'}</CardDescription>
                                  </CardHeader>
                                  <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                                     <div className="bg-secondary/50 p-4 rounded-lg">
                                        <p className="text-xs font-bold text-primary uppercase tracking-wider mb-2">Why it matches your vibe</p>
                                        <p className="text-sm text-muted-foreground leading-relaxed italic">"{match.vibeReason}"</p>
                                     </div>
                                     <Button 
                                        className="w-full shadow-sm hover:shadow-md transition-shadow" 
                                        onClick={() => item && addToLibrary(item, 'To Watch')}
                                        disabled={!item}
                                     >
                                        <CheckCircle className="mr-2 h-4 w-4" />
                                        {item ? "Add to Watchlist" : "Item not found on TMDB"}
                                     </Button>
                                  </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}
