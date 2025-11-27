import { Card, Grid, GridCol, NumberInput, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { useScoreboard } from '@/hooks/useScoreboard.tsx';

type PlayerCardProps = {
  name: string;
  idx: number;
};

export const PlayerCard: FunctionComponent<PlayerCardProps> = ({ name, idx }) => {
  /* ------------------------------------------------------------------
   * Pull everything we need from the scoreboard context
   * ------------------------------------------------------------------ */
  const { rounds, currentRound, setPrediction, setActual, scores, setScoreChange } = useScoreboard();

  /* ------------------------------------------------------------------
   * Derived values – read‑only, always up‑to‑date
   * ------------------------------------------------------------------ */
  const prediction = rounds[currentRound].predictions[idx];
  const actual = rounds[currentRound].actuals[idx];
  const score = scores[idx];
  const scoreChange = rounds[currentRound].scoreChanges[idx];

  /* ------------------------------------------------------------------
   * Handlers – update the context directly
   * ------------------------------------------------------------------ */
  const handlePredictionChange = (value: number | string) => {
    const n = typeof value === 'string' ? parseInt(value, 10) : value;
    setPrediction(currentRound, idx, n);
  };

  const handleActualChange = (value: number | string) => {
    const newActual = typeof value === 'string' ? parseInt(value, 10) : value;
    setActual(currentRound, idx, newActual);

    /* ---- calculate score immediately, no useEffect needed ---- */
    const currentPrediction = rounds[currentRound].predictions[idx];
    if (currentPrediction === newActual) {
      setScoreChange(currentRound, idx, 20 + 10 * newActual);
    } else if (currentPrediction) {
      const diff = Math.abs(currentPrediction - newActual);
      setScoreChange(currentRound, idx, diff * -10);
    }
  };

  /* ------------------------------------------------------------------
   * UI
   * ------------------------------------------------------------------ */
  return (
    <Card shadow="sm" padding="sm" radius="md" withBorder>
      <Card.Section withBorder inheritPadding>
        <Text fw={500}>{name}</Text>
      </Card.Section>

      <Grid gutter="xs" mt="sm">
        {/* Score & change */}
        <GridCol m={'auto'} span={6}>
          <Text size="lg">{score}</Text>
          <Text c="dimmed" size="sm">
            {scoreChange}
          </Text>
        </GridCol>

        {/* Inputs */}
        <GridCol span={6}>
          <NumberInput min={0} label="Prediction" value={prediction} onChange={handlePredictionChange} />
          <NumberInput min={0} label="Actual" value={actual} onChange={handleActualChange} />
        </GridCol>
      </Grid>
    </Card>
  );
};
