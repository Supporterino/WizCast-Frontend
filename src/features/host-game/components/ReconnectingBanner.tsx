import { Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';

interface ReconnectingBannerProps {
  isReconnecting: boolean;
}

export const ReconnectingBanner: FunctionComponent<ReconnectingBannerProps> = ({ isReconnecting }) => {
  const { t } = useTranslation();

  if (!isReconnecting) return null;

  return (
    <Text size="sm" c="yellow" ta="center" mb="xs">
      {t('gameScreen.reconnecting', 'Reconnecting...')}
    </Text>
  );
};
