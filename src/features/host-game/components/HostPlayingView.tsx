import { Grid, GridCol } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { HostPlayerCard } from './HostPlayerCard.tsx';
import type { FunctionComponent } from 'react';
import type { PlayerSlot, RoundData, StoredGame  } from '@/types/game.ts';
import { calculatePlayerAccuracy } from '@/utils/playerAccuracy.ts';
import { AccuracyBadgeGrid } from '@/shared/components/AccuracyBadgeGrid/AccuracyBadgeGrid.tsx';
import { PredictionsTotalsBar } from '@/shared/components/PredictionsTotalsBar/PredictionsTotalsBar.tsx';
import { FlexCol } from '@/shared/components/Layout/FlexCol.tsx';

interface HostPlayingViewProps {
  players: Array<string>;
  rounds: Array<RoundData>;
  scores: Array<number>;
  currentRound: number;
  sessionActive: boolean;
  playerSlots: Array<PlayerSlot>;
}

export const HostPlayingView: FunctionComponent<HostPlayingViewProps> = ({
  players,
  rounds,
  scores,
  currentRound,
  sessionActive,
  playerSlots,
}) => {
  const { t } = useTranslation();

  const round = rounds[currentRound] as RoundData | undefined;
  const totalPredictions = round ? round.predictions.reduce((acc, val) => acc! + (!isNaN(val!) ? val! : 0), 0)! : 0;
  const totalActuals = round ? round.actuals.reduce((acc, val) => acc! + (!isNaN(val!) ? val! : 0), 0)! : 0;
  const accuracyData = calculatePlayerAccuracy({ players, rounds, scores } as StoredGame);

  return (
    <FlexCol fullWidth h="100%" justify="flex-start" mb="md">
      <PredictionsTotalsBar
        predictionsLabel={t('gameScreen.predictions')}
        actualsLabel={t('gameScreen.actuals')}
        totalPredictions={totalPredictions}
        totalActuals={totalActuals}
        roundDisplay={currentRound + 1}
      />

      <Grid mt="md">
        {players.map((name, idx) => {
          const isRemote = playerSlots[idx]?.slotStatus === 'claimed' || playerSlots[idx]?.slotStatus === 'disconnected';
          return (
            <GridCol span={6} key={idx}>
              <HostPlayerCard
                name={name}
                idx={idx}
                slotStatus={playerSlots[idx]?.slotStatus}
                isRemoteConnected={isRemote}
                sessionActive={sessionActive}
              />
            </GridCol>
          );
        })}
      </Grid>

      <AccuracyBadgeGrid players={players} accuracyData={accuracyData} />
    </FlexCol>
  );
};
