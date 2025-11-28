import { useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { GameContext } from '@/contexts/GameProvider.tsx';

export const usePlayers = (): {
  players: Array<string>;
  setPlayers: Dispatch<SetStateAction<Array<string>>>;
} => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('usePlayers must be used within a GameProvider');
  const { players, setPlayers } = ctx;
  return { players, setPlayers };
};
