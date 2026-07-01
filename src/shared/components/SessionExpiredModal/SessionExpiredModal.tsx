import { Button, Modal, Stack, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';

interface SessionExpiredModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message: string;
  rejoinLabel: string;
  closeLabel: string;
  onRejoin: () => void;
}

export const SessionExpiredModal: FunctionComponent<SessionExpiredModalProps> = ({
  opened,
  onClose,
  title,
  message,
  rejoinLabel,
  closeLabel,
  onRejoin,
}) => (
  <Modal opened={opened} onClose={onClose} title={title}>
    <Text mb="md">{message}</Text>
    <Stack>
      <Button onClick={onRejoin}>{rejoinLabel}</Button>
      <Button variant="default" onClick={onClose}>
        {closeLabel}
      </Button>
    </Stack>
  </Modal>
);
