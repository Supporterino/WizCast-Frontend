import { useContext } from 'react';
import type { RulesContextProps } from '@/contexts/RulesProvider.tsx';
import { RulesContext } from '@/contexts/RulesProvider.tsx';

export const useRules = (): RulesContextProps => {
  const ctx = useContext(RulesContext);
  if (!ctx) {
    throw new Error('useRules must be used within a RulesProvider');
  }
  return ctx;
};
