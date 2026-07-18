import { ActionIcon, Text } from '@mantine/core';
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconReportAnalytics } from '@tabler/icons-react';
import type { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexRow } from '@/shared/components/Layout/FlexRow.tsx';

interface RoundNavigatorProps {
  currentRound: number;
  roundCount: number;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export const RoundNavigator: FunctionComponent<RoundNavigatorProps> = ({ currentRound, roundCount, onPrevious, onNext, onFinish }) => {
  const { t } = useTranslation();

  return (
    <FlexRow fullWidth gap="md">
      <ActionIcon size="lg" mr="auto" variant="light" onClick={onPrevious} disabled={currentRound === 0}>
        <IconArrowNarrowLeft stroke={1.5} />
      </ActionIcon>

      <Text>
        {t('labels.currentRound', {
          current: currentRound + 1,
          total: roundCount,
        })}
      </Text>

      <ActionIcon size="lg" ml="auto" variant="light" onClick={onNext} disabled={currentRound + 1 === roundCount}>
        <IconArrowNarrowRight stroke={1.5} />
      </ActionIcon>

      {currentRound + 1 === roundCount && (
        <ActionIcon onClick={onFinish}>
          <IconReportAnalytics stroke={1.5} />
        </ActionIcon>
      )}
    </FlexRow>
  );
};
