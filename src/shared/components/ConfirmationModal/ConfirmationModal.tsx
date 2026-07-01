import { Button, Modal, Stack, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';

interface ConfirmationModalProps {
  opened: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
}

export const ConfirmationModal: FunctionComponent<ConfirmationModalProps> = ({
  opened,
  onClose,
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
}) => (
  <Modal opened={opened} onClose={onClose} title={title}>
    <Text mb="md">{message}</Text>
    <Stack>
      <Button color="red" onClick={onConfirm}>
        {confirmLabel}
      </Button>
      <Button variant="default" onClick={onClose}>
        {cancelLabel}
      </Button>
    </Stack>
  </Modal>
);
