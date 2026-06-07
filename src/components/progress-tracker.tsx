"use client";

import type { CineItem } from "@/app/lib/types";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

type ProgressTrackerProps = {
  item: CineItem;
};

export function ProgressTracker({ item }: ProgressTrackerProps) {
  const [progress, setProgress] = useState(item.progress?.percentage ?? 0);
  const [season, setSeason] = useState(item.progress?.season ?? 1);
  const [episode, setEpisode] = useState(item.progress?.episode ?? 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Track Progress</CardTitle>
      </CardHeader>
      <CardContent>
        {item.type === "movie" ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Label htmlFor="movie-progress">Progress: {progress}%</Label>
                {progress > 10 && item.status === 'To Watch' && <Badge variant="secondary">Started</Badge>}
            </div>
            <Slider
              id="movie-progress"
              defaultValue={[progress]}
              max={100}
              step={1}
              onValueChange={(value) => setProgress(value[0])}
            />
            <Button className="w-full">Update Progress</Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="season">Season</Label>
                <Input
                  id="season"
                  type="number"
                  value={season}
                  onChange={(e) => setSeason(parseInt(e.target.value, 10))}
                  min="1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="episode">Episode</Label>
                <Input
                  id="episode"
                  type="number"
                  value={episode}
                  onChange={(e) => setEpisode(parseInt(e.target.value, 10))}
                  min="1"
                />
              </div>
            </div>
            <div className="text-sm text-muted-foreground pt-2">
              Next Up: Season {season}, Episode {episode + 1}
            </div>
            <Button className="w-full">Log Episode</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
