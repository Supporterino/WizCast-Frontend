import { Badge, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { SLOT_STATUS_COLORS } from '@/shared/constants.ts';
import type { SlotStatus } from '@/types/game.ts';

interface SlotStatusBadgeProps {
  status: SlotStatus;
}

export const SlotStatusBadge: FunctionComponent<SlotStatusBadgeProps> = ({ status }) => (
  <Badge color={SLOT_STATUS_COLORS[status]} variant="light" size="sm">
    <Text size="xs">{status}</Text>
  </Badge>
);
