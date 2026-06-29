import { Button, NumberInput, Stack, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import type { FunctionComponent } from 'react';
import type { Rule } from '@/types/game.ts';
import { validateRoundSubmission } from '@/utils/scoring.ts';

interface ContestantScoreInputProps {
  playerIndex: number;
  roundIndex: number;
  maxValue: number;
  rules: Array<Rule>;
  onSubmit: (predictions: Array<number>, actuals: Array<number>) => void;
  disabled: boolean;
}

export const ContestantScoreInput: FunctionComponent<ContestantScoreInputProps> = ({
  roundIndex,
  maxValue,
  rules,
  onSubmit,
  disabled,
}) => {
  const { t } = useTranslation();
  const [prediction, setPrediction] = useState<number | string>('');
  const [actual, setActual] = useState<number | string>('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = () => {
    const pred = typeof prediction === 'string' ? parseInt(prediction, 10) : prediction;
    const act = typeof actual === 'string' ? parseInt(actual, 10) : actual;
    if (isNaN(pred) || isNaN(act)) return;

    const preds: Array<number | undefined> = [pred];
    const acts: Array<number | undefined> = [act];

    const validation = validateRoundSubmission(roundIndex, preds, acts, rules);
    if (!validation.valid) {
      setError(validation.message ?? t('contestant.validationError', 'Invalid submission'));
      return;
    }

    setError(null);
    onSubmit([pred], [act]);
    setPrediction('');
    setActual('');
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
        onChange={(v) => {
          setPrediction(v);
          setError(null);
        }}
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
        onChange={(v) => {
          setActual(v);
          setError(null);
        }}
        hideControls
        disabled={disabled}
      />
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <Button onClick={handleSubmit} disabled={disabled || prediction === '' || actual === ''}>
        {t('contestant.submitScore', 'Submit Score')}
      </Button>
    </Stack>
  );
};
