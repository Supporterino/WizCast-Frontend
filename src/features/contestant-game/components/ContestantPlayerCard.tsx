import { useEffect, useState } from 'react';
import type { FunctionComponent } from 'react';
import type { RoundData } from '@/types/game.ts';
import { PlayerCard } from '@/shared/components/PlayerCard/PlayerCard.tsx';

interface ContestantPlayerCardProps {
  name: string;
  idx: number;
  prediction?: number;
  actual?: number;
  score?: number;
  scoreChange?: number;
  currentRound: number;
  playingRound: number;
  playerCount: number;
  rounds: Array<RoundData>;
  isOwnCard: boolean;
  isFrozen: boolean;
  onPredictionChange: (value: number) => void;
  onActualChange: (value: number) => void;
}

export const ContestantPlayerCard: FunctionComponent<ContestantPlayerCardProps> = ({
  name,
  idx,
  prediction,
  actual,
  score,
  scoreChange,
  currentRound,
  playingRound,
  playerCount,
  rounds,
  isOwnCard,
  isFrozen,
  onPredictionChange,
  onActualChange,
}) => {
  const [localPrediction, setLocalPrediction] = useState<number | undefined>(undefined);
  const [localActual, setLocalActual] = useState<number | undefined>(undefined);

  useEffect(() => {
    setLocalPrediction(undefined);
    setLocalActual(undefined);
  }, [prediction, actual]);

  const enableCallbacks = isOwnCard && !isFrozen;
  const displayPrediction = isOwnCard ? (localPrediction ?? prediction) : prediction;
  const displayActual = isOwnCard ? (localActual ?? actual) : actual;

  return (
    <PlayerCard
      name={name}
      idx={idx}
      prediction={displayPrediction}
      actual={displayActual}
      score={score}
      scoreChange={scoreChange}
      currentRound={currentRound}
      playingRound={playingRound}
      playerCount={playerCount}
      rounds={rounds}
      inputsDisabled={!enableCallbacks}
      onPredictionChange={
        enableCallbacks
          ? (value) => {
              setLocalPrediction(value);
              onPredictionChange(value);
            }
          : undefined
      }
      onActualChange={
        enableCallbacks
          ? (value) => {
              setLocalActual(value);
              onActualChange(value);
            }
          : undefined
      }
    />
  );
};
