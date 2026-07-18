import type { FunctionComponent } from 'react';
import { PlayerCard } from '@/shared/components/PlayerCard/PlayerCard.tsx';
import { useGame } from '@/shared/hooks/useGame.tsx';
import type { RoundData, SlotStatus } from '@/types/game.ts';
import { computeSingleScoreChange } from '@/utils/scoring.ts';

interface HostPlayerCardProps {
  name: string;
  idx: number;
  slotStatus?: SlotStatus;
  isRemoteConnected?: boolean;
}

export const HostPlayerCard: FunctionComponent<HostPlayerCardProps> = ({ name, idx, slotStatus, isRemoteConnected }) => {
  const { currentRound, playingRound, players, rounds, scores, setPrediction, setActual, setScoreChange } = useGame();

  const round = rounds[currentRound] as RoundData | undefined;

  return (
    <PlayerCard
      name={name}
      idx={idx}
      prediction={round?.predictions[idx]}
      actual={round?.actuals[idx]}
      score={scores[idx]}
      scoreChange={round?.scoreChanges[idx]}
      currentRound={currentRound}
      playingRound={playingRound}
      playerCount={players.length}
      rounds={rounds}
      slotStatus={slotStatus}
      isRemoteConnected={isRemoteConnected}
      inputsDisabled={currentRound !== playingRound}
      showEditabilityIndicator={false}
      onPredictionChange={(value) => {
        setPrediction(currentRound, idx, value);
        const currentActual = rounds[currentRound]?.actuals[idx];
        if (currentActual !== undefined) {
          setScoreChange(currentRound, idx, computeSingleScoreChange(value, currentActual));
        }
      }}
      onActualChange={(value) => {
        setActual(currentRound, idx, value);
        const currentPrediction = rounds[currentRound]?.predictions[idx];
        if (currentPrediction !== undefined) {
          setScoreChange(currentRound, idx, computeSingleScoreChange(currentPrediction, value));
        }
      }}
    />
  );
};
