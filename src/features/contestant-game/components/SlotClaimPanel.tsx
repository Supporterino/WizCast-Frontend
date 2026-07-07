import { Button, Card, Stack, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';
import type { SlotStatus } from '@/types/game.ts';

interface SlotClaimPanelProps {
  players: Array<string>;
  slotStatuses: Array<SlotStatus>;
  onClaim: (playerIndex: number) => void;
  claimedIndex: number | null;
  error: string | null;
}

export const SlotClaimPanel: FunctionComponent<SlotClaimPanelProps> = ({ players, slotStatuses, onClaim, claimedIndex, error }) => {
  const { t } = useTranslation();

  return (
    <Stack>
      <Text fw={500}>{t('claim.selectSlot', 'Select a player slot')}</Text>
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      {players.map((name, idx) => {
        const status = slotStatuses[idx] ?? 'unclaimed';
        const isMine = claimedIndex === idx;
        const isAvailable = status === 'unclaimed' || status === 'disconnected';
        return (
          <Card key={name} shadow="sm" padding="sm" radius="md" withBorder>
            <FlexRow fullWidth>
              <Text>
                {name} {isMine ? t('claim.yourSlot', '(your slot)') : ''}
              </Text>
              <Button
                variant="light"
                size="xs"
                disabled={!isAvailable && !isMine}
                color={isMine ? 'green' : 'blue'}
                onClick={() => onClaim(idx)}
              >
                {isMine ? t('claim.claimed', 'Claimed') : isAvailable ? t('claim.claim', 'Claim') : t('claim.taken', 'Taken')}
              </Button>
            </FlexRow>
          </Card>
        );
      })}
      {players.length === 0 && <Text c="dimmed">{t('claim.noSlots', 'No player slots available')}</Text>}
    </Stack>
  );
};
