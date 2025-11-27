import { useContext } from 'react';
import type { ScoreboardContextProps } from '@/contexts/ScoreboardProvider.tsx';
import { ScoreboardContext } from '@/contexts/ScoreboardProvider.tsx';

export const useScoreboard = (): ScoreboardContextProps => {
  const ctx = useContext(ScoreboardContext);
  if (!ctx) {
    throw new Error('useScoreboard must be used inside a ScoreboardProvider');
  }
  return ctx;
};
