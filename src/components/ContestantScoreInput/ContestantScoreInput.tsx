import { Button, NumberInput, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { FunctionComponent } from 'react';

interface ContestantScoreInputProps {
  playerIndex: number;
  roundIndex: number;
  maxValue: number;
  onSubmit: (predictions: Array<number>, actuals: Array<number>) => void;
  disabled: boolean;
}

export const ContestantScoreInput: FunctionComponent<ContestantScoreInputProps> = ({ roundIndex, maxValue, onSubmit, disabled }) => {
  const { t } = useTranslation();
  const [prediction, setPrediction] = useState<number | string>('');
  const [actual, setActual] = useState<number | string>('');

  const handleSubmit = () => {
    const pred = typeof prediction === 'string' ? parseInt(prediction, 10) : prediction;
    const act = typeof actual === 'string' ? parseInt(actual, 10) : actual;
    if (!isNaN(pred) && !isNaN(act)) {
      onSubmit([pred], [act]);
      setPrediction('');
      setActual('');
    }
  };

  return (
    <Stack>
      <Text size="sm" fw={500}>
        {t('contestant.round', 'Round')} {roundIndex + 1}
      </Text>
      <NumberInput
        label={t('playerCard.prediction')}
        min={0}
        max={maxValue}
        clampBehavior="strict"
        allowDecimal={false}
        allowNegative={false}
        value={prediction}
        onChange={setPrediction}
        hideControls
        disabled={disabled}
      />
      <NumberInput
        label={t('playerCard.actual')}
        min={0}
        max={maxValue}
        clampBehavior="strict"
        allowDecimal={false}
        allowNegative={false}
        value={actual}
        onChange={setActual}
        hideControls
        disabled={disabled}
      />
      <Button onClick={handleSubmit} disabled={disabled || prediction === '' || actual === ''}>
        {t('contestant.submitScore', 'Submit Score')}
      </Button>
    </Stack>
  );
};
