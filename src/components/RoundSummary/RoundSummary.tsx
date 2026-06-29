import { Box, Modal, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import type { FunctionComponent } from 'react';

interface RoundSummaryProps {
  players: Array<string>;
  scoreChanges: Array<number>;
  roundIndex: number;
  onDismiss: () => void;
}

export const RoundSummary: FunctionComponent<RoundSummaryProps> = ({ players, scoreChanges, roundIndex, onDismiss }) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 4000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <Modal
      opened
      onClose={onDismiss}
      title={<Title order={3}>{t('roundSummary.title', 'Round ') + (roundIndex + 1) + t('roundSummary.complete', ' Complete')}</Title>}
      size="sm"
      closeOnClickOutside={false}
      closeOnEscape={false}
    >
      <Stack>
        <Text size="sm" c="dimmed">
          {t('roundSummary.subtitle', 'Score changes:')}
        </Text>
        {players.map((name, idx) => {
          const change = scoreChanges[idx] ?? 0;
          const color = change > 0 ? 'green' : change < 0 ? 'red' : undefined;
          return (
            <Box key={idx}>
              <Text fw={500}>{name}</Text>
              <Text c={color} size="lg" fw={700}>
                {change > 0 ? '+' : ''}
                {change}
              </Text>
            </Box>
          );
        })}
      </Stack>
    </Modal>
  );
};
