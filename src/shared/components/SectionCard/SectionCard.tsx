import { Card } from '@mantine/core';
import type { FunctionComponent, ReactNode } from 'react';

interface SectionCardProps {
  children: ReactNode;
}

export const SectionCard: FunctionComponent<SectionCardProps> = ({ children }) => (
  <Card shadow="sm" padding="sm" radius="md" withBorder>
    {children}
  </Card>
);
