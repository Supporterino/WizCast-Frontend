import type { FunctionComponent } from 'react';
import type { RoundData, SlotStatus } from '@/types/game.ts';
import { useGame } from '@/shared/hooks/useGame.tsx';
import { computeSingleScoreChange } from '@/utils/scoring.ts';
import { PlayerCard } from '@/shared/components/PlayerCard/PlayerCard.tsx';

interface HostPlayerCardProps {
  name: string;
  idx: number;
  slotStatus?: SlotStatus;
  isRemoteConnected?: boolean;
  sessionActive: boolean;
  onBroadcast: () => void;
}

export const HostPlayerCard: FunctionComponent<HostPlayerCardProps> = ({
  name,
  idx,
  slotStatus,
  isRemoteConnected,
  sessionActive,
  onBroadcast,
}) => {
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
      inputsDisabled={!sessionActive || currentRound !== playingRound}
      onPredictionChange={
        sessionActive
          ? (value) => {
              setPrediction(currentRound, idx, value);
              const currentActual = rounds[currentRound]?.actuals[idx];
              if (currentActual !== undefined) {
                setScoreChange(currentRound, idx, computeSingleScoreChange(value, currentActual));
              }
              onBroadcast();
            }
          : undefined
      }
      onActualChange={
        sessionActive
          ? (value) => {
              setActual(currentRound, idx, value);
              const currentPrediction = rounds[currentRound]?.predictions[idx];
              if (currentPrediction !== undefined) {
                setScoreChange(currentRound, idx, computeSingleScoreChange(currentPrediction, value));
              }
              onBroadcast();
            }
          : undefined
      }
    />
  );
};
