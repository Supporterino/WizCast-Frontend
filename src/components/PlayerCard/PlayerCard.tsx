import { Card, Grid, GridCol, NumberInput, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import type { FunctionComponent } from 'react';
import { useGame } from '@/hooks/useGame.tsx';

type PlayerCardProps = {
  name: string;
  idx: number;
};

export const PlayerCard: FunctionComponent<PlayerCardProps> = ({ name, idx }) => {
  const { rounds, currentRound, setPrediction, setActual, scores, setScoreChange } = useGame();

  const prediction = rounds[currentRound].predictions[idx];
  const actual = rounds[currentRound].actuals[idx];
  const score = scores[idx];
  const scoreChange = rounds[currentRound].scoreChanges[idx];
  const { t } = useTranslation();

  const handlePredictionChange = (value: number | string) => {
    const n = typeof value === 'string' ? parseInt(value, 10) : value;
    setPrediction(currentRound, idx, n);
  };

  const handleActualChange = (value: number | string) => {
    const newActual = typeof value === 'string' ? parseInt(value, 10) : value;
    setActual(currentRound, idx, newActual);

    const currentPrediction = rounds[currentRound].predictions[idx];
    if (currentPrediction === newActual) {
      setScoreChange(currentRound, idx, 20 + 10 * newActual);
    } else if (currentPrediction) {
      const diff = Math.abs(currentPrediction - newActual);
      setScoreChange(currentRound, idx, diff * -10);
    }
  };

  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Card.Section withBorder inheritPadding>
        <Text fw={500}>{name}</Text>
      </Card.Section>

      <Grid gutter="xs" mt="sm">
        <GridCol m={'auto'} span={6}>
          <Text size="lg">{score}</Text>
          <Text c="dimmed" size="sm">
            {scoreChange}
          </Text>
        </GridCol>

        <GridCol span={6}>
          <NumberInput
            key={`prediction-${currentRound}-${idx}`}
            min={0}
            label={t('playerCard.prediction')}
            value={prediction ?? undefined}
            onChange={handlePredictionChange}
            hideControls
          />

          <NumberInput
            key={`actual-${currentRound}-${idx}`}
            min={0}
            label={t('playerCard.actual')}
            value={actual ?? undefined}
            onChange={handleActualChange}
            hideControls
          />
        </GridCol>
      </Grid>
    </Card>
  );
};
