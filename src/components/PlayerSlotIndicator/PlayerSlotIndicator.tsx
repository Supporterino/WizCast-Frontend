import { Badge, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import type { SlotStatus } from '@/types/game.ts';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

interface PlayerSlotIndicatorProps {
  status: SlotStatus;
}

const colorMap: Record<SlotStatus, string> = {
  unclaimed: 'gray',
  claimed: 'green',
  disconnected: 'orange',
};

export const PlayerSlotIndicator: FunctionComponent<PlayerSlotIndicatorProps> = ({ status }) => {
  return (
    <FlexRow>
      <Badge color={colorMap[status]} variant="light" size="sm">
        <Text size="xs">{status}</Text>
      </Badge>
    </FlexRow>
  );
};
