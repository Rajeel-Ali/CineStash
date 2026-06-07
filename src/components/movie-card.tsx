
'use client';

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { CineItem, Status } from "@/app/lib/types";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusCircle, Eye, CheckCircle, Trash2, Info } from "lucide-react";
import { useLibraryManager } from "@/hooks/use-library-manager";

type MovieCardProps = {
  item: CineItem;
  className?: string;
  aspectRatio?: "portrait" | "square";
  width?: number;
  height?: number;
  isOnlineResult?: boolean;
  disableActions?: boolean;
};

export function MovieCard({
  item,
  className,
  aspectRatio = "portrait",
  width = 250,
  height = 375,
  isOnlineResult = false,
  disableActions = false,
}: MovieCardProps) {
  const router = useRouter();
  const { addToLibrary, updateItemStatus, removeFromLibrary } = useLibraryManager();
  const [imgError, setImgError] = useState(false);
  const imageUrl = item.posterId ? `https://image.tmdb.org/t/p/w500${item.posterId}` : null;

  const linkHref = isOnlineResult ? `/add-item?tmdbId=${item.tmdbId}&type=${item.type}` : `/item/${item.id}`;

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const renderOnlineResultActions = () => (
    <>
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white w-full" onClick={(e) => handleActionClick(e, () => addToLibrary(item, 'Watched'))}>
          <CheckCircle className="mr-2 h-4 w-4"/>
          Watched
      </Button>
      <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white w-full" onClick={(e) => handleActionClick(e, () => addToLibrary(item, 'To Watch'))}>
          <Eye className="mr-2 h-4 w-4"/>
          Watch Later
      </Button>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white w-full" asChild>
          <Link href={linkHref} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
             <PlusCircle className="mr-2 h-4 w-4"/>
             More Info
          </Link>
       </Button>
    </>
  );

  const renderLibraryActions = () => {
    if (item.status === 'Watched') {
        return (
            <>
                <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white w-full" asChild>
                   <Link href={linkHref} onClick={(e) => e.stopPropagation()} className="flex items-center justify-center">
                     <Info className="mr-2 h-4 w-4"/>
                     More Info
                   </Link>
               </Button>
               <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/20 hover:text-destructive-foreground w-full" onClick={(e) => handleActionClick(e, () => removeFromLibrary(item.id))}>
                    <Trash2 className="mr-2 h-4 w-4"/>
                    Remove
                </Button>
            </>
        )
    }
    
    return (
        <>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white w-full" onClick={(e) => handleActionClick(e, () => updateItemStatus(item.id, 'Watched'))}>
                <CheckCircle className="mr-2 h-4 w-4"/>
                Mark as Watched
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/20 hover:text-destructive-foreground w-full" onClick={(e) => handleActionClick(e, () => removeFromLibrary(item.id))}>
                <Trash2 className="mr-2 h-4 w-4"/>
                Remove
            </Button>
        </>
    );
  }

  const handleCardClick = () => {
    if (disableActions) return;
    router.push(linkHref);
  }

  const showActions = !disableActions;


  return (
    <div className={cn("space-y-3 group", className)}>
        <Card 
            className="overflow-hidden transition-all duration-200 ease-in-out group-hover:shadow-lg group-hover:shadow-primary/20 group-hover:border-primary/50"
            onClick={handleCardClick}
            style={{ cursor: disableActions ? 'default' : 'pointer' }}
        >
            <CardContent className="p-0">
                <div className="overflow-hidden relative block">
                    {imageUrl && !imgError ? (
                      <Image
                        src={imageUrl}
                        alt={`Poster for ${item.title}`}
                        width={width}
                        height={height}
                        onError={() => setImgError(true)}
                        className={cn(
                            "h-auto w-auto object-cover transition-transform duration-300 ease-in-out group-hover:scale-105",
                            aspectRatio === "portrait" ? "aspect-[2/3]" : "aspect-square"
                        )}
                      />
                    ) : (
                      <div className={cn(
                        "w-full bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center p-4",
                        aspectRatio === "portrait" ? "aspect-[2/3]" : "aspect-square"
                      )}>
                        <span className="text-4xl mb-2">🤔</span>
                        <span className="text-xs text-zinc-500 font-medium">Poster not found</span>
                      </div>
                    )}
                    {showActions && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center p-4 space-y-2">
                        {isOnlineResult ? renderOnlineResultActions() : renderLibraryActions()}
                      </div>
                    )}
                </div>
            </CardContent>
        </Card>
        <div className="space-y-1 text-sm">
            <h3 className="font-medium leading-none truncate">{item.title}</h3>
            <p className="text-xs text-muted-foreground">{item.year}</p>
        </div>
    </div>
  );
}
