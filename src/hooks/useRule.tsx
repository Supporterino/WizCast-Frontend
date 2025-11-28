import { useContext } from 'react';
import { GameContext } from '@/contexts/GameProvider.tsx';

export const useRules = (): {
  rules: Array<{
    name: string;
    description: string;
    active: boolean;
  }>;
  toggleRule: (index: number) => void;
} => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useRules must be used within a GameProvider');
  const { rules, toggleRule } = ctx;
  return { rules, toggleRule };
};
