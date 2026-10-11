import { useMantineColorScheme } from '@mantine/core';
import { useEffect } from 'react';
import { setStatusBarStyle } from '@/shared/services/status-bar.ts';

export const useStatusBarStyle = (): void => {
  const { colorScheme } = useMantineColorScheme();

  useEffect(() => {
    void setStatusBarStyle(colorScheme);
  }, [colorScheme]);
};
