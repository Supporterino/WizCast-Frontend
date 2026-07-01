import { useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { RoundData, Rule, StoredGame } from '@/types/game.ts';
import { Route as ResultRoute } from '@/routes/results/overview';

interface GameLifecycleParams {
  gameId: string;
  startDate: Date | undefined;
  location: string;
  players: Array<string>;
  rules: Array<Rule>;
  rounds: Array<RoundData>;
  scores: Array<number>;
  currentRound: number;
  setCurrentRound: (round: number) => void;
  setPlayingRound: (updater: (prev: number) => number) => void;
  setPrediction: (roundIdx: number, playerIdx: number, value: number) => void;
  setActual: (roundIdx: number, playerIdx: number, value: number) => void;
  setScoreChange: (roundIdx: number, playerIdx: number, value: number) => void;
  endGame: () => void;
  setCompletedGames: (updater: (prev: Array<StoredGame>) => Array<StoredGame>) => void;
  broadcastState: () => void;
  sessionActive: boolean;
  validateRoundFn: (currentRound: number, predictions: Array<number | undefined>, actuals: Array<number | undefined>, rules: Array<Rule>) => boolean;
}

export function useGameLifecycle({
  gameId,
  startDate,
  location,
  players,
  rules,
  rounds,
  currentRound,
  setCurrentRound,
  setPlayingRound,
  setCompletedGames,
  broadcastState,
  sessionActive,
  validateRoundFn,
}: GameLifecycleParams) {
  const navigate = useNavigate();

  const buildGameSnapshot = useCallback((): StoredGame => ({
    id: gameId,
    startDate: startDate!,
    endDate: new Date(),
    location,
    players,
    rules,
    rounds,
    scores: rounds.reduce((acc, r) => {
      r.scoreChanges.forEach((sc, i) => (sc ? (acc[i] += sc) : undefined));
      return acc;
    }, Array(players.length).fill(0)),
  }), [gameId, startDate, location, players, rules, rounds]);

  const handleNextRound = useCallback(() => {
    if (!sessionActive) return;
    if (!validateRoundFn(currentRound, rounds[currentRound].predictions, rounds[currentRound].actuals, rules)) return;
    setPlayingRound((prev) => prev + 1);
    broadcastState();
    setCurrentRound(currentRound + 1);
  }, [sessionActive, validateRoundFn, currentRound, rounds, rules, setPlayingRound, broadcastState, setCurrentRound]);

  const handleFinishGame = useCallback(() => {
    if (!sessionActive) return;
    if (!validateRoundFn(currentRound, rounds[currentRound].predictions, rounds[currentRound].actuals, rules)) return;

    const finishedGame = buildGameSnapshot();
    setCompletedGames((prev) => [...prev, finishedGame]);
    broadcastState();
    setCurrentRound(currentRound + 1);
    navigate({ to: ResultRoute.to });
  }, [sessionActive, validateRoundFn, currentRound, rounds, rules, buildGameSnapshot, setCompletedGames, broadcastState, setCurrentRound, navigate]);

  return { buildGameSnapshot, handleNextRound, handleFinishGame };
}
