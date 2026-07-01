import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { ConfirmationModal } from '@/shared/components/ConfirmationModal/ConfirmationModal.tsx';

interface DeleteGameModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteGameModal: FunctionComponent<DeleteGameModalProps> = ({ opened, onClose, onConfirm }) => {
  const { t } = useTranslation();

  return (
    <ConfirmationModal
      opened={opened}
      onClose={onClose}
      title={t('gameOverview.deleteConfirmationTitle')}
      message={t('gameOverview.deleteConfirmationMessage')}
      confirmLabel={t('gameOverview.delete')}
      cancelLabel={t('gameOverview.cancel')}
      onConfirm={onConfirm}
    />
  );
};
