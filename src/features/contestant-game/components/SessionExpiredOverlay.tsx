import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { SessionExpiredModal } from '@/shared/components/SessionExpiredModal/SessionExpiredModal.tsx';

interface SessionExpiredOverlayProps {
  opened: boolean;
  onClose: () => void;
  onRejoin: () => void;
}

export const SessionExpiredOverlay: FunctionComponent<SessionExpiredOverlayProps> = ({
  opened,
  onClose,
  onRejoin,
}) => {
  const { t } = useTranslation();

  return (
    <SessionExpiredModal
      opened={opened}
      onClose={onClose}
      title={t('join.sessionExpiredTitle', 'Session Expired')}
      message={t('join.sessionExpiredMessage', 'Your session has expired. Would you like to rejoin the game?')}
      rejoinLabel={t('join.rejoinGame', 'Rejoin Game')}
      closeLabel={t('common.close', 'Close')}
      onRejoin={onRejoin}
    />
  );
};
