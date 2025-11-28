import { useContext } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { RoundData } from '@/contexts/GameProvider.tsx';
import { GameContext } from '@/contexts/GameProvider.tsx';

export const useScoreboard = (): {
  rounds: Array<RoundData>;
  scores: Array<number>;
  roundCount: number;
  currentRound: number;
  setCurrentRound: Dispatch<SetStateAction<number>>;
  setPrediction: (roundIdx: number, playerIdx: number, value: number) => void;
  setActual: (roundIdx: number, playerIdx: number, value: number) => void;
  setScoreChange: (roundIdx: number, playerIdx: number, value: number) => void;
} => {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useScoreboard must be used within a GameProvider');
  const { rounds, scores, roundCount, currentRound, setCurrentRound, setPrediction, setActual, setScoreChange } = ctx;
  return {
    rounds,
    scores,
    roundCount,
    currentRound,
    setCurrentRound,
    setPrediction,
    setActual,
    setScoreChange,
  };
};
