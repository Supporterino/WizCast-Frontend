import { useContext } from 'react';
import type { GameContextProps } from '@/contexts/GameProvider.tsx';
import { GameContext } from '@/contexts/GameProvider.tsx';

export const useGame = (): GameContextProps => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
};
