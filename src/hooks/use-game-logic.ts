'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Position, Direction } from '@/types';

const GAME_SPEED_MS = 150;

interface UseGameLogicProps {
  gridSize: number;
}

export const useGameLogic = ({ gridSize }: UseGameLogicProps) => {
  const [snake, setSnake] = useState<Position[]>([]);
  const [food, setFood] = useState<Position>({ x: -1, y: -1 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isGameRunning, setIsGameRunning] = useState(false);
  const [isAutoPlay, setIsAutoPlay] = useState(false);

  const gameLoopRef = useRef<NodeJS.Timeout>();

  const generateFood = useCallback(
    (snakeBody: Position[]): Position => {
      while (true) {
        const newFood = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize),
        };
        if (!snakeBody.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
          return newFood;
        }
      }
    },
    [gridSize]
  );
  
  const startGame = useCallback(() => {
    const initialSnake = [{ x: Math.floor(gridSize / 2), y: Math.floor(gridSize / 2) }];
    setSnake(initialSnake);
    setFood(generateFood(initialSnake));
    setDirection('RIGHT');
    setScore(0);
    setIsGameOver(false);
    setIsGameRunning(true);
  }, [gridSize, generateFood]);

  const changeDirection = useCallback((newDirection: Direction) => {
    if (isAutoPlay) return; // Ignore user input in autoplay mode
    setDirection(currentDirection => {
      if (
        (newDirection === 'UP' && currentDirection === 'DOWN') ||
        (newDirection === 'DOWN' && currentDirection === 'UP') ||
        (newDirection === 'LEFT' && currentDirection === 'RIGHT') ||
        (newDirection === 'RIGHT' && currentDirection === 'LEFT')
      ) {
        return currentDirection;
      }
      return newDirection;
    });
  }, [isAutoPlay]);
  
  const toggleAutoPlay = () => {
    setIsAutoPlay(prev => !prev);
  };

  const getAutoPlayDirection = useCallback((currentSnake: Position[], currentFood: Position, currentDirection: Direction): Direction => {
    const head = currentSnake[0];
    const possibleMoves: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];

    const isSafe = (pos: Position) => {
      return (
        pos.x >= 0 &&
        pos.x < gridSize &&
        pos.y >= 0 &&
        pos.y < gridSize &&
        !currentSnake.some(segment => segment.x === pos.x && segment.y === pos.y)
      );
    };

    const getNextHead = (dir: Direction): Position => {
        let nextHead = { ...head };
        if (dir === 'UP') nextHead.y--;
        if (dir === 'DOWN') nextHead.y++;
        if (dir === 'LEFT') nextHead.x--;
        if (dir === 'RIGHT') nextHead.x++;
        return nextHead;
    }

    const safeMoves = possibleMoves.filter(dir => {
        const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        return dir !== opposite[currentDirection] && isSafe(getNextHead(dir));
    });
    
    if (safeMoves.length === 0) return currentDirection; // No safe moves

    // Basic AI: Move towards food
    const dx = currentFood.x - head.x;
    const dy = currentFood.y - head.y;

    const preferredMoves: Direction[] = [];
    if (Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) preferredMoves.push('RIGHT');
        else preferredMoves.push('LEFT');
        if (dy > 0) preferredMoves.push('DOWN');
        else preferredMoves.push('UP');
    } else {
        if (dy > 0) preferredMoves.push('DOWN');
        else preferredMoves.push('UP');
        if (dx > 0) preferredMoves.push('RIGHT');
        else preferredMoves.push('LEFT');
    }

    for (const move of preferredMoves) {
        if (safeMoves.includes(move)) return move;
    }

    return safeMoves[Math.floor(Math.random() * safeMoves.length)]; // Pick a random safe move if preferred is not available
  }, [gridSize]);


  const runGame = useCallback(() => {
    if (!isGameRunning || isGameOver) return;
    
    setSnake(prevSnake => {
      if (prevSnake.length === 0) return [];
      
      const newSnake = [...prevSnake];
      const head = { ...newSnake[0] };
      
      let currentMoveDirection = direction;
      if (isAutoPlay) {
          currentMoveDirection = getAutoPlayDirection(newSnake, food, direction);
          setDirection(currentMoveDirection);
      }

      switch (currentMoveDirection) {
        case 'UP': head.y -= 1; break;
        case 'DOWN': head.y += 1; break;
        case 'LEFT': head.x -= 1; break;
        case 'RIGHT': head.x += 1; break;
      }
      
      // Wall collision
      if (head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize) {
        setIsGameOver(true);
        setIsGameRunning(false);
        return prevSnake;
      }
      
      // Self collision
      for (let i = 1; i < newSnake.length; i++) {
        if (head.x === newSnake[i].x && head.y === newSnake[i].y) {
          setIsGameOver(true);
          setIsGameRunning(false);
          return prevSnake;
        }
      }
      
      newSnake.unshift(head);
      
      // Food collision
      if (head.x === food.x && head.y === food.y) {
        setScore(s => s + 1);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }
      
      return newSnake;
    });
  }, [isGameRunning, isGameOver, direction, food, gridSize, generateFood, isAutoPlay, getAutoPlayDirection]);

  useEffect(() => {
    if(gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (isGameRunning && !isGameOver) {
      gameLoopRef.current = setInterval(runGame, GAME_SPEED_MS);
    }
    return () => {
      if(gameLoopRef.current) clearInterval(gameLoopRef.current);
    };
  }, [runGame, isGameRunning, isGameOver]);
  
  return {
    gridSize,
    snake,
    food,
    score,
    isGameOver,
    isAutoPlay,
    isGameRunning,
    startGame,
    changeDirection,
    toggleAutoPlay
  };
};
