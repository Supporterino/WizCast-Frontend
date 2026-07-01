import { Alert } from '@mantine/core';
import { IconExclamationCircleFilled, IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import type { RoundData, Rule } from '@/types/game.ts';

interface ValidationBannerProps {
  rules: Array<Rule>;
  currentRound: number;
  round: RoundData;
}

export const ValidationBanner: FunctionComponent<ValidationBannerProps> = ({ rules, currentRound, round }) => {
  const { t } = useTranslation();

  const predictions = round.predictions;
  const actuals = round.actuals;

  if (rules[0]?.active &&
    predictions.every((val) => val !== undefined) &&
    predictions.reduce((acc, val) => acc + val, 0) === currentRound + 1) {
    return (
      <Alert
        my="md"
        variant="light"
        color="blue"
        radius="md"
        title={t('alerts.predictionMatches.title')}
        icon={<IconInfoCircle stroke={1.5} />}
      >
        {t('alerts.predictionMatches.message')}
      </Alert>
    );
  }

  if (!predictions.every((v) => (isNaN(v!) ? true : (v ?? 0) <= currentRound + 1))) {
    return (
      <Alert
        my="xs"
        variant="light"
        color="red"
        title={t('notifications.roundIncorrect.title')}
        icon={<IconExclamationCircleFilled stroke={1.5} />}
      >
        {t('notifications.roundIncorrect.tooManyPredictions')}
      </Alert>
    );
  }

  if (actuals.every((v) => v !== undefined) &&
    actuals.reduce((acc, val) => acc + val, 0) !== currentRound + 1) {
    return (
      <Alert
        my="xs"
        variant="light"
        color="red"
        title={t('notifications.roundIncorrect.title')}
        icon={<IconExclamationCircleFilled stroke={1.5} />}
      >
        {t('notifications.roundIncorrect.actualMismatch')}
      </Alert>
    );
  }

  return null;
};
