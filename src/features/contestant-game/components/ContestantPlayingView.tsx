import { Badge, Grid, GridCol, Stack } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { ContestantPlayerCard } from './ContestantPlayerCard.tsx';
import type { FunctionComponent } from 'react';
import type { RoundData, StoredGame } from '@/types/game.ts';
import { calculatePlayerAccuracy } from '@/utils/playerAccuracy.ts';
import { AccuracyBadgeGrid } from '@/shared/components/AccuracyBadgeGrid/AccuracyBadgeGrid.tsx';
import { PredictionsTotalsBar } from '@/shared/components/PredictionsTotalsBar/PredictionsTotalsBar.tsx';

interface ContestantPlayingViewProps {
  players: Array<string>;
  rounds: Array<RoundData>;
  scores: Array<number>;
  currentRound: number;
  claimedIndex: number;
  localPrediction?: number;
  localActual?: number;
  onPredictionChange: (value: number) => void;
  onActualChange: (value: number) => void;
  isFrozen: boolean;
}

export const ContestantPlayingView: FunctionComponent<ContestantPlayingViewProps> = ({
  players,
  rounds,
  scores,
  currentRound,
  claimedIndex,
  localPrediction,
  localActual,
  onPredictionChange,
  onActualChange,
  isFrozen,
}) => {
  const { t } = useTranslation();

  const roundCount = rounds.length;
  const currentDisplay = currentRound + 1;
  const round = rounds[currentRound] as RoundData | undefined;
  const totalPredictions = round ? round.predictions.reduce((acc, val) => acc! + (val !== undefined ? val : 0), 0)! : 0;
  const totalActuals = round ? round.actuals.reduce((acc, val) => acc! + (val !== undefined ? val : 0), 0)! : 0;
  const accuracyData = calculatePlayerAccuracy({ players, rounds, scores } as StoredGame);

  return (
    <Stack>
      {roundCount > 0 && (
        <Badge variant="light" size="lg">
          {t('join.roundBadge', { current: currentDisplay, total: roundCount })}
        </Badge>
      )}
      {roundCount > 0 && (
        <PredictionsTotalsBar
          predictionsLabel={t('gameScreen.predictions')}
          actualsLabel={t('gameScreen.actuals')}
          totalPredictions={totalPredictions}
          totalActuals={totalActuals}
          roundDisplay={currentDisplay}
        />
      )}
      <Grid>
        {players.map((name, idx) => {
          const isOwnCard = idx === claimedIndex;
          return (
            <GridCol span={6} key={idx}>
              <ContestantPlayerCard
                name={name}
                idx={idx}
                prediction={isOwnCard ? (localPrediction ?? round?.predictions[idx]) : round?.predictions[idx]}
                actual={isOwnCard ? (localActual ?? round?.actuals[idx]) : round?.actuals[idx]}
                score={scores[idx]}
                scoreChange={round?.scoreChanges[idx]}
                currentRound={currentRound}
                playingRound={currentRound}
                playerCount={players.length}
                rounds={rounds}
                isOwnCard={isOwnCard}
                isFrozen={isFrozen}
                onPredictionChange={onPredictionChange}
                onActualChange={onActualChange}
              />
            </GridCol>
          );
        })}
      </Grid>
      {roundCount > 0 && (
        <AccuracyBadgeGrid players={players} accuracyData={accuracyData} />
      )}
    </Stack>
  );
};
