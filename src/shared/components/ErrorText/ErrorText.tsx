import { Text } from '@mantine/core';
import type { FunctionComponent, ReactNode } from 'react';

interface ErrorTextProps {
  children: ReactNode;
}

export const ErrorText: FunctionComponent<ErrorTextProps> = ({ children }) => (
  <Text c="red" size="sm">
    {children}
  </Text>
);
