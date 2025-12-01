import { Card, Grid, GridCol, NumberInput, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconCardsFilled } from '@tabler/icons-react';
import type { FunctionComponent } from 'react';
import { useGame } from '@/hooks/useGame.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

type PlayerCardProps = {
  name: string;
  idx: number;
};

export const PlayerCard: FunctionComponent<PlayerCardProps> = ({ name, idx }) => {
  const { rounds, currentRound, setPrediction, setActual, scores, setScoreChange, players, playingRound } = useGame();

  const prediction = rounds[currentRound].predictions[idx];
  const actual = rounds[currentRound].actuals[idx];
  const score = scores[idx];
  const scoreChange = rounds[currentRound].scoreChanges[idx];
  const { t } = useTranslation();

  const handlePredictionChange = (value: number | string) => {
    const newPrediction = typeof value === 'string' ? parseInt(value, 10) : value;
    setPrediction(currentRound, idx, newPrediction);

    const currentActual = rounds[currentRound].actuals[idx];
    if (currentActual || currentActual == 0) {
      if (newPrediction === currentActual) {
        setScoreChange(currentRound, idx, 20 + 10 * currentActual);
      } else {
        const diff = Math.abs(newPrediction - currentActual);
        setScoreChange(currentRound, idx, diff * -10);
      }
    }
  };

  const handleActualChange = (value: number | string) => {
    const newActual = typeof value === 'string' ? parseInt(value, 10) : value;
    setActual(currentRound, idx, newActual);

    const currentPrediction = rounds[currentRound].predictions[idx];
    if (currentPrediction || currentPrediction == 0) {
      if (currentPrediction === newActual) {
        setScoreChange(currentRound, idx, 20 + 10 * newActual);
      } else {
        const diff = Math.abs(currentPrediction - newActual);
        setScoreChange(currentRound, idx, diff * -10);
      }
    }
  };

  const isPredictionEmpty = prediction === undefined;
  const isActualEmpty = actual === undefined;

  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Card.Section withBorder inheritPadding>
        <FlexRow fullWidth p={'xs'}>
          <Text mr={'auto'} fw={500}>
            {name}
          </Text>
          {idx == currentRound % players.length && <IconCardsFilled color={'red'} stroke={1.5} />}
        </FlexRow>
      </Card.Section>

      <Grid gutter="xs" mt="sm">
        <GridCol m={'auto'} span={6}>
          <Text size="xl">{score}</Text>
          <Text c="dimmed" size="sm">
            {scoreChange}
          </Text>
        </GridCol>

        <GridCol span={6}>
          {/* Prediction input */}
          <NumberInput
            key={`prediction-${currentRound}-${idx}`}
            min={0}
            max={currentRound + 1}
            clampBehavior="strict"
            label={t('playerCard.prediction')}
            value={prediction ?? undefined}
            onChange={handlePredictionChange}
            hideControls
            disabled={currentRound !== playingRound}
            error={isPredictionEmpty}
          />

          {/* Actual input */}
          <NumberInput
            key={`actual-${currentRound}-${idx}`}
            min={0}
            max={currentRound + 1}
            clampBehavior="strict"
            label={t('playerCard.actual')}
            value={actual ?? undefined}
            onChange={handleActualChange}
            hideControls
            disabled={currentRound !== playingRound}
            error={isActualEmpty}
          />
        </GridCol>
      </Grid>
    </Card>
  );
};
