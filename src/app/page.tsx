'use client';

import { useEffect, useState } from 'react';
import { Bot, Play, RefreshCw } from 'lucide-react';

import { useGameLogic } from '@/hooks/use-game-logic';
import GameBoard from '@/components/game/game-board';
import GameOverDialog from '@/components/game/game-over-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Position } from '@/types';
import { Separator } from '@/components/ui/separator';

const GRID_SIZE = 20;
const MIN_SWIPE_DISTANCE = 30;

export default function Home() {
  const {
    gridSize,
    snake,
    food,
    score,
    isGameOver,
    isAutoPlay,
    isGameRunning,
    startGame,
    changeDirection,
    toggleAutoPlay,
  } = useGameLogic({ gridSize: GRID_SIZE });

  const [touchStart, setTouchStart] = useState<Position | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGameRunning) return;
      switch (e.key) {
        case 'ArrowUp':
          changeDirection('UP');
          break;
        case 'ArrowDown':
          changeDirection('DOWN');
          break;
        case 'ArrowLeft':
          changeDirection('LEFT');
          break;
        case 'ArrowRight':
          changeDirection('RIGHT');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [changeDirection, isGameRunning]);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isGameRunning) return;
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStart || !isGameRunning) return;

    const touchCurrent = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    
    const dx = touchCurrent.x - touchStart.x;
    const dy = touchCurrent.y - touchStart.y;

    if (Math.abs(dx) < MIN_SWIPE_DISTANCE && Math.abs(dy) < MIN_SWIPE_DISTANCE) return;

    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      changeDirection(dy > 0 ? 'DOWN' : 'UP');
    }
    
    setTouchStart(null); // Reset after a swipe is registered
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4 font-headline">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-primary/20">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tighter text-primary">
            Slither Classic
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-4 px-2">
            <div className="text-lg">
              Score: <span className="font-bold text-accent">{score}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={toggleAutoPlay} variant="ghost" size="icon" aria-label="Toggle Autoplay">
                {isAutoPlay ? <Bot className="text-accent" /> : <Play />}
              </Button>
              <Button onClick={startGame} variant="ghost" size="icon" aria-label="Restart Game">
                <RefreshCw />
              </Button>
            </div>
          </div>
          <Separator className="mb-4 bg-primary/20"/>
          <div
            className="relative w-full aspect-square bg-muted/20 rounded-lg overflow-hidden touch-none shadow-inner"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          >
            {isGameRunning ? (
                <GameBoard snake={snake} food={food} gridSize={gridSize} />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    <Button onClick={startGame} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        Start Game
                    </Button>
                </div>
            )}
          </div>
        </CardContent>
      </Card>
      <GameOverDialog
        isOpen={isGameOver}
        score={score}
        onRestart={startGame}
      />
    </div>
  );
}
