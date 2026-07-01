import { useContext } from 'react';
import type { StoreContextProps } from '@/contexts/StoreProvider.tsx';
import { StoreContext } from '@/contexts/StoreProvider.tsx';

export const useStore = (): StoreContextProps => {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within a StoreProvider');
  return ctx;
};
