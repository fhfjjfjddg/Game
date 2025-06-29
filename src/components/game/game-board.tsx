'use client';

import type { Position } from '@/types';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
}

const GameBoard = ({ snake, food, gridSize }: GameBoardProps) => {
  return (
    <div
      className="relative w-full h-full grid"
      style={{
        gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
        gridTemplateRows: `repeat(${gridSize}, 1fr)`,
      }}
    >
      {snake.map((segment, index) => (
        <div
          key={index}
          className={cn(
            'absolute transition-all duration-75',
            index === 0 ? 'bg-primary shadow-[0_0_8px_hsl(var(--primary))]' : 'bg-primary/80',
            'rounded-[2px]'
          )}
          style={{
            width: `calc(100% / ${gridSize})`,
            height: `calc(100% / ${gridSize})`,
            left: `${(segment.x / gridSize) * 100}%`,
            top: `${(segment.y / gridSize) * 100}%`,
          }}
        />
      ))}
      <div
        className="absolute bg-accent rounded-full shadow-[0_0_12px_hsl(var(--accent))]"
        style={{
          width: `calc(100% / ${gridSize})`,
          height: `calc(100% / ${gridSize})`,
          left: `${(food.x / gridSize) * 100}%`,
          top: `${(food.y / gridSize) * 100}%`,
        }}
      />
    </div>
  );
};

export default GameBoard;
