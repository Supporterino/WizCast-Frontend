import { Badge, Group } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';

interface IncomingScoreAlertProps {
  isConnected: boolean;
  isReconnecting: boolean;
  claimedCount: number;
  disconnectedCount: number;
}

export const IncomingScoreAlert: FunctionComponent<IncomingScoreAlertProps> = ({
  isConnected,
  isReconnecting,
  claimedCount,
  disconnectedCount,
}) => {
  const { t } = useTranslation();

  return (
    <Group>
      <Badge color={isConnected ? 'green' : 'red'} variant="dot">
        {isConnected ? t('multiplayer.connected', 'Connected') : t('multiplayer.disconnected', 'Disconnected')}
      </Badge>
      {isReconnecting && (
        <Badge color="yellow" variant="light">
          {t('multiplayer.reconnecting', 'Reconnecting...')}
        </Badge>
      )}
      {claimedCount > 0 && (
        <Badge color="green" variant="light">
          {claimedCount} {t('multiplayer.claimed', 'claimed')}
        </Badge>
      )}
      {disconnectedCount > 0 && (
        <Badge color="orange" variant="light">
          {disconnectedCount} {t('multiplayer.disconnectedSlots', 'disconnected')}
        </Badge>
      )}
    </Group>
  );
};
