import { useContext } from 'react';
import type { ConnectionContextValue } from '@/contexts/ConnectionProvider.tsx';
import { ConnectionContext } from '@/contexts/ConnectionProvider.tsx';

export const useConnection = (): ConnectionContextValue => {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be used within ConnectionProvider');
  return ctx;
};
