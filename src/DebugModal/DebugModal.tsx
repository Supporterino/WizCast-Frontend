import { Code, Modal } from '@mantine/core';
import type { FunctionComponent } from 'react';

type DebugModalProps = {
  opened: boolean;
  onClose: () => void;
  data: string;
};

export const DebugModal: FunctionComponent<DebugModalProps> = ({ opened, onClose, data }) => {
  return (
    <Modal opened={opened} onClose={onClose} title={'Debug'} centered>
      <Code block>{data}</Code>
    </Modal>
  );
};
