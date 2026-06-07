
'use client';
import { PanInfo, motion, useAnimate, useMotionValue, useTransform } from 'framer-motion';
import Image from 'next/image';
import { CineItem } from '@/app/lib/types';
import { useEffect, useRef, useState } from 'react';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';

interface TinderLikeCardProps {
  item: CineItem;
  onSwipe: (action: 'left' | 'right') => void;
  onHold: () => void;
  isTopCard: boolean;
  cardIndex: number;
  totalCards: number;
}

export function TinderLikeCard({ item: movie, onSwipe, onHold, isTopCard, cardIndex, totalCards }: TinderLikeCardProps) {
  const [scope, animate] = useAnimate();
  const x = useMotionValue(0);
  const holdTimeout = useRef<NodeJS.Timeout | null>(null);
  const [imgError, setImgError] = useState(false);
  const imageUrl = movie.posterId ? `https://image.tmdb.org/t/p/w500${movie.posterId}` : null;

  const onDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!isTopCard) return;
    
    const { offset, velocity } = info;
    const swipePower = Math.abs(offset.x) * velocity.x;

    if (!scope.current) return; // Prevent animation on unmounted component

    if (swipePower < -10000) { // Swipe Left
        animate(scope.current, { x: '-150%', opacity: 0 }, { duration: 0.3 }).then(() => onSwipe('left'));
    } else if (swipePower > 10000) { // Swipe Right
        animate(scope.current, { x: '150%', opacity: 0 }, { duration: 0.3 }).then(() => onSwipe('right'));
    } else {
        animate(scope.current, { x: 0, rotate: 0 }, { type: 'spring', stiffness: 300, damping: 20 });
        x.set(0);
    }
  };

  const handlePointerDown = () => {
    if (!isTopCard) return;
    holdTimeout.current = setTimeout(() => {
        onHold();
    }, 500); // 500ms for a long press
  };

  const handlePointerUpOrLeave = () => {
      if (holdTimeout.current) {
        clearTimeout(holdTimeout.current);
        holdTimeout.current = null;
      }
  };


  useEffect(() => {
    const cardElement = scope.current;
    if (cardElement) {
        cardElement.addEventListener('pointerdown', handlePointerDown);
        cardElement.addEventListener('pointerup', handlePointerUpOrLeave);
        cardElement.addEventListener('pointerleave', handlePointerUpOrLeave);
        
        // Clean up event listeners
        return () => {
            cardElement.removeEventListener('pointerdown', handlePointerDown);
            cardElement.removeEventListener('pointerup', handlePointerUpOrLeave);
            cardElement.removeEventListener('pointerleave', handlePointerUpOrLeave);
            if (holdTimeout.current) {
                clearTimeout(holdTimeout.current);
            }
        };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTopCard, onHold]);
  
  const positionInStack = cardIndex;

  useEffect(() => {
    const yOffset = isTopCard ? 0 : -positionInStack * 10;
    const scale = isTopCard ? 1 : 1 - positionInStack * 0.05;
    const zIndex = totalCards - positionInStack;

    if (scope.current) {
        animate(scope.current, {
            y: yOffset,
            scale: scale,
            zIndex: zIndex,
        }, { type: 'spring', stiffness: 300, damping: 30 });
    }

  }, [cardIndex, isTopCard, animate, scope, positionInStack, totalCards]);
  
  const rotate = useTransform(x, [-window.innerWidth / 2, window.innerWidth / 2], [-15, 15]);

  const rightOpacity = useTransform(x, [0, 50], [0, 1]);
  const leftOpacity = useTransform(x, [0, -50], [0, 1]);

  const getLabel = (direction: 'left' | 'right') => {
      switch(direction){
          case 'left': return 'SKIP';
          case 'right': return 'WATCHED';
      }
  }
  
  return (
    <motion.div
      ref={scope}
      className="absolute w-full h-full"
      drag={isTopCard}
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={(e, info) => {
        if(holdTimeout.current) clearTimeout(holdTimeout.current);
        onDragEnd(e, info);
      }}
       onDragStart={() => {
        if (holdTimeout.current) {
          clearTimeout(holdTimeout.current);
          holdTimeout.current = null;
        }
      }}
      style={{
        originX: 'center',
        originY: 'bottom',
        transform: 'translateZ(0)',
        x,
        rotate,
      }}
      whileDrag={{ cursor: 'grabbing' }}
      whileTap={isTopCard ? { scale: 0.98 } : {}}
    >
      <div className="relative w-full h-full bg-card rounded-2xl shadow-2xl overflow-hidden cursor-grab touch-none">
        {imageUrl && !imgError ? (
          <Image
            src={imageUrl}
            alt={`Poster for ${movie.title}`}
            fill
            className="object-cover pointer-events-none"
            priority={isTopCard}
            sizes="(max-width: 640px) 90vw, 384px"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900 border border-zinc-800 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-6xl mb-3">🤔</span>
            <span className="text-sm text-zinc-500 font-medium">Poster not found</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white pointer-events-none">
          <h3 className="text-2xl sm:text-3xl font-bold font-headline drop-shadow-lg">{movie.title}</h3>
          <div className="flex items-center justify-between text-sm mt-2">
              <p className="text-lg font-semibold drop-shadow-md">{movie.year}</p>
               {movie.rating && movie.rating > 0 && (
                  <Badge variant="secondary" className="gap-1.5 backdrop-blur-sm bg-black/30 border-white/20">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400"/>
                      <span className="font-bold">{movie.rating}</span>
                  </Badge>
              )}
          </div>
        </div>
        
        {isTopCard && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              {/* Right Swipe Indicator */}
              <motion.div style={{ opacity: rightOpacity }} className="absolute p-4 border-4 border-green-500 text-green-500 rounded-lg bg-black/30 transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rotate-[15deg]">
                  <h3 className="text-xl font-bold">{getLabel('right')}</h3>
              </motion.div>
              {/* Left Swipe Indicator */}
              <motion.div style={{ opacity: leftOpacity }} className="absolute p-4 border-4 border-destructive text-destructive rounded-lg bg-black/30 transform -translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2 rotate-[-15deg]">
                  <h3 className="text-xl font-bold">{getLabel('left')}</h3>
              </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
