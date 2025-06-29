'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface GameOverDialogProps {
  isOpen: boolean;
  score: number;
  onRestart: () => void;
}

const GameOverDialog = ({ isOpen, score, onRestart }: GameOverDialogProps) => {
  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-center text-3xl font-bold text-destructive">
            Game Over
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center text-lg">
            Your final score is: <span className="font-bold text-accent">{score}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button onClick={onRestart} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
            <RefreshCw className="mr-2 h-4 w-4" />
            Play Again
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default GameOverDialog;
