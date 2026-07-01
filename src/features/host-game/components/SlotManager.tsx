import { Button, Card, Group, Modal, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import type { PlayerSlot } from '@/types/game.ts';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { SlotStatusBadge } from '@/shared/components/SlotStatusBadge/SlotStatusBadge.tsx';

interface SlotManagerProps {
  playerSlots: Array<PlayerSlot>;
  onReleaseSlot: (slot: PlayerSlot) => void;
  releaseConfirm: PlayerSlot | null;
  setReleaseConfirm: (slot: PlayerSlot | null) => void;
  onConfirmRelease: () => void;
}

export const SlotManager: FunctionComponent<SlotManagerProps> = ({
  playerSlots,
  onReleaseSlot,
  releaseConfirm,
  setReleaseConfirm,
  onConfirmRelease,
}) => {
  const { t } = useTranslation();

  return (
    <>
      <Text size="sm" fw={500}>
        {t('multiplayer.playerSlots', 'Player Slots')}
      </Text>

      {playerSlots.map((slot) => (
        <Card key={slot.playerIndex} shadow="xs" padding="xs" radius="sm" withBorder>
          <FlexRow fullWidth>
            <Text size="sm">{slot.playerName}</Text>
            {(slot.slotStatus === 'claimed' || slot.slotStatus === 'disconnected') && (
              <Button
                variant="subtle"
                color="red"
                size="compact-xs"
                onClick={() => onReleaseSlot(slot)}
              >
                {t('multiplayer.releaseSlot', 'Release')}
              </Button>
            )}
            <SlotStatusBadge status={slot.slotStatus} />
          </FlexRow>
        </Card>
      ))}

      <Modal opened={!!releaseConfirm} onClose={() => setReleaseConfirm(null)} title={t('multiplayer.releaseConfirmTitle', 'Release Slot')}>
        <Text mb="md">
          {t('multiplayer.releaseConfirmBody', { name: releaseConfirm?.playerName ?? '' })}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setReleaseConfirm(null)}>
            {t('multiplayer.cancel', 'Cancel')}
          </Button>
          <Button color="red" onClick={onConfirmRelease}>
            {t('multiplayer.releaseSlot', 'Release')}
          </Button>
        </Group>
      </Modal>
    </>
  );
};
