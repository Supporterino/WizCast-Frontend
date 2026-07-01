import { ActionIcon, Text } from '@mantine/core';
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconReportAnalytics } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

interface RoundNavigatorProps {
  currentRound: number;
  roundCount: number;
  sessionActive: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export const RoundNavigator: FunctionComponent<RoundNavigatorProps> = ({
  currentRound,
  roundCount,
  sessionActive,
  onPrevious,
  onNext,
  onFinish,
}) => {
  const { t } = useTranslation();

  return (
    <FlexRow fullWidth gap="md">
      <ActionIcon size="lg" mr="auto" variant="light" onClick={onPrevious} disabled={currentRound === 0 || !sessionActive}>
        <IconArrowNarrowLeft stroke={1.5} />
      </ActionIcon>

      <Text>
        {t('labels.currentRound', {
          current: currentRound + 1,
          total: roundCount,
        })}
      </Text>

      <ActionIcon size="lg" ml="auto" variant="light" onClick={onNext} disabled={currentRound + 1 === roundCount || !sessionActive}>
        <IconArrowNarrowRight stroke={1.5} />
      </ActionIcon>

      {currentRound + 1 === roundCount && (
        <ActionIcon onClick={onFinish} disabled={!sessionActive}>
          <IconReportAnalytics stroke={1.5} />
        </ActionIcon>
      )}
    </FlexRow>
  );
};
