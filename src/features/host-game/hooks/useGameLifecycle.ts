import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';
import type { ConnectionContextValue } from '@/contexts/ConnectionProvider.tsx';
import { Route as ResultRoute } from '@/routes/results/overview';
import type { RoundData, Rule, StoredGame } from '@/types/game.ts';

interface GameLifecycleParams {
  conn: ConnectionContextValue;
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
  sessionActive: boolean;
  validateRoundFn: (
    currentRound: number,
    predictions: Array<number | undefined>,
    actuals: Array<number | undefined>,
    rules: Array<Rule>,
  ) => boolean;
}

export function useGameLifecycle({
  conn,
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
  sessionActive,
  validateRoundFn,
}: GameLifecycleParams) {
  const navigate = useNavigate();

  const buildGameSnapshot = useCallback(
    (): StoredGame => ({
      id: gameId,
      startDate: startDate!,
      endDate: new Date(),
      location,
      players,
      rules,
      rounds,
      scores: rounds.reduce((acc, r) => {
        r.scoreChanges.forEach((sc, i) => {
          if (sc) acc[i] += sc;
        });
        return acc;
      }, Array(players.length).fill(0)),
    }),
    [gameId, startDate, location, players, rules, rounds],
  );

  const handleNextRound = useCallback(() => {
    if (!validateRoundFn(currentRound, rounds[currentRound].predictions, rounds[currentRound].actuals, rules)) return;
    if (sessionActive)
      conn.sendEvent('round-completed', { roundIndex: currentRound, scoreChanges: rounds[currentRound].scoreChanges, players });
    setPlayingRound((prev) => prev + 1);
    setCurrentRound(currentRound + 1);
  }, [conn, sessionActive, validateRoundFn, currentRound, rounds, rules, setPlayingRound, setCurrentRound, players]);

  const handleFinishGame = useCallback(() => {
    if (!validateRoundFn(currentRound, rounds[currentRound].predictions, rounds[currentRound].actuals, rules)) return;

    if (sessionActive)
      conn.sendEvent('round-completed', { roundIndex: currentRound, scoreChanges: rounds[currentRound].scoreChanges, players });

    const finishedGame = buildGameSnapshot();
    setCompletedGames((prev) => [...prev, finishedGame]);
    setCurrentRound(currentRound + 1);
    navigate({ to: ResultRoute.to });
  }, [
    conn,
    sessionActive,
    validateRoundFn,
    currentRound,
    rounds,
    rules,
    buildGameSnapshot,
    setCompletedGames,
    setCurrentRound,
    navigate,
    players,
  ]);

  return { buildGameSnapshot, handleNextRound, handleFinishGame };
}
