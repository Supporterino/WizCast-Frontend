import { Badge, Card, Grid, GridCol, NumberInput, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconCardsFilled } from '@tabler/icons-react';
import { useEffect, useRef } from 'react';
import type { FunctionComponent } from 'react';
import type { SlotStatus } from '@/types/game.ts';
import { useGame } from '@/hooks/useGame.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { computeSingleScoreChange, getScoreTillRound } from '@/utils/scoring.ts';

type PlayerCardProps = {
  name: string;
  idx: number;
  prediction?: number;
  actual?: number;
  score?: number;
  scoreChange?: number;
  currentRound?: number;
  playingRound?: number;
  playerCount?: number;
  onPredictionChange?: (value: number) => void;
  onActualChange?: (value: number) => void;
  isRemoteConnected?: boolean;
  slotStatus?: SlotStatus;
};

export const PlayerCard: FunctionComponent<PlayerCardProps> = ({
  name,
  idx,
  prediction: overridePrediction,
  actual: overrideActual,
  score: overrideScore,
  scoreChange: overrideScoreChange,
  currentRound: overrideCurrentRound,
  playingRound: overridePlayingRound,
  playerCount: overridePlayerCount,
  onPredictionChange,
  onActualChange,
  isRemoteConnected,
  slotStatus,
}) => {
  const { rounds, currentRound: ctxCurrentRound, setPrediction, setActual, scores, setScoreChange, players, playingRound: ctxPlayingRound } = useGame();

  const currentRound = overrideCurrentRound ?? ctxCurrentRound;
  const playingRound = overridePlayingRound ?? ctxPlayingRound;
  const playerCount = overridePlayerCount ?? players.length;

  const prediction = overridePrediction ?? rounds[currentRound]?.predictions[idx];
  const actual = overrideActual ?? rounds[currentRound]?.actuals[idx];
  const score = overrideScore ?? scores[idx];
  const scoreChange = overrideScoreChange ?? rounds[currentRound]?.scoreChanges[idx];
  const { t } = useTranslation();

  const predictionDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const actualDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  useEffect(() => {
    return () => {
      if (predictionDebounceRef.current) clearTimeout(predictionDebounceRef.current);
      if (actualDebounceRef.current) clearTimeout(actualDebounceRef.current);
    };
  }, []);

  const handlePredictionChange = (value: number | string) => {
    const newPrediction = typeof value === 'string' ? parseInt(value, 10) : value;

    if (onPredictionChange) {
      if (predictionDebounceRef.current) clearTimeout(predictionDebounceRef.current);
      predictionDebounceRef.current = setTimeout(() => {
        onPredictionChange(newPrediction);
      }, 300);
    } else {
      setPrediction(currentRound, idx, newPrediction);

      const currentActual = rounds[currentRound]?.actuals[idx];
      if (currentActual !== undefined) {
        setScoreChange(currentRound, idx, computeSingleScoreChange(newPrediction, currentActual));
      }
    }
  };

  const handleActualChange = (value: number | string) => {
    const newActual = typeof value === 'string' ? parseInt(value, 10) : value;

    if (onActualChange) {
      if (actualDebounceRef.current) clearTimeout(actualDebounceRef.current);
      actualDebounceRef.current = setTimeout(() => {
        onActualChange(newActual);
      }, 300);
    } else {
      setActual(currentRound, idx, newActual);

      const currentPrediction = rounds[currentRound]?.predictions[idx];
      if (currentPrediction !== undefined) {
        setScoreChange(currentRound, idx, computeSingleScoreChange(currentPrediction, newActual));
      }
    }
  };

  const isPredictionEmpty = prediction === undefined;
  const isActualEmpty = actual === undefined;
  const hasOverrides = overrideCurrentRound !== undefined;
  const hasCallbacks = onPredictionChange !== undefined || onActualChange !== undefined;
  const inputsDisabled = hasOverrides ? !hasCallbacks : currentRound !== playingRound;

  const badgeLabel =
    slotStatus === 'disconnected' ? t('playerCard.disconnected', 'Disconnected') : t('playerCard.remote', 'Remote');
  const badgeColor = slotStatus === 'disconnected' ? 'orange' : 'green';

  return (
    <Card
      shadow="sm"
      padding="sm"
      radius="md"
      withBorder
      bg={isRemoteConnected ? 'var(--mantine-color-green-light-hover)' : undefined}
    >
      <Card.Section withBorder inheritPadding>
        <FlexRow fullWidth p={'xs'}>
          <Text mr={'auto'} fw={500}>
            {name}
          </Text>
          {isRemoteConnected && (
            <Badge color={badgeColor} variant="light" size="xs" mr="xs">
              {badgeLabel}
            </Badge>
          )}
          {idx == currentRound % playerCount && <IconCardsFilled color={'red'} stroke={1.5} />}
        </FlexRow>
      </Card.Section>

      <Grid gap="xs" mt="sm">
        <GridCol m={'auto'} span={6}>
          <Text size="xl">{currentRound === playingRound ? score : getScoreTillRound(rounds, currentRound + 1, playerCount)[idx]}</Text>
          <Text c="dimmed" size="sm">
            {scoreChange}
          </Text>
        </GridCol>

        <GridCol span={6}>
          <NumberInput
            key={`prediction-${currentRound}-${idx}`}
            min={0}
            max={currentRound + 1}
            clampBehavior="strict"
            allowDecimal={false}
            allowNegative={false}
            label={t('playerCard.prediction')}
            value={prediction ?? undefined}
            onChange={handlePredictionChange}
            hideControls
            disabled={inputsDisabled}
            error={isPredictionEmpty}
          />

          <NumberInput
            key={`actual-${currentRound}-${idx}`}
            min={0}
            max={currentRound + 1}
            clampBehavior="strict"
            allowDecimal={false}
            allowNegative={false}
            label={t('playerCard.actual')}
            value={actual ?? undefined}
            onChange={handleActualChange}
            hideControls
            disabled={inputsDisabled}
            error={isActualEmpty}
          />
        </GridCol>
      </Grid>
    </Card>
  );
};
