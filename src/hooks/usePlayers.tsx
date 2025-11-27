import { useContext } from 'react';
import type { PlayersContextProps } from '@/contexts/PlayerProvider.tsx';
import { PlayersContext } from '@/contexts/PlayerProvider.tsx';

export const usePlayers = (): PlayersContextProps => {
  const ctx = useContext(PlayersContext);
  if (!ctx) throw new Error('usePlayers must be used within a PlayersProvider');
  return ctx;
};
