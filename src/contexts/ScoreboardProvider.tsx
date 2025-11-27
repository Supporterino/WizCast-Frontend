import { createContext, useState } from 'react';
import type { FunctionComponent, ReactNode } from 'react';

export type RoundData = {
  id: number; // round index (0‑based)
  predictions: Array<number | undefined>; // prediction per player
  actuals: Array<number | undefined>; // hits actually taken
  scoreChanges: Array<number | undefined>; // change to the global score
};

export interface ScoreboardContextProps {
  players: Array<string>; // names of the players
  rounds: Array<RoundData>; // all rounds that have been created
  scores: Array<number>; // cumulative score per player
  roundCount: number;

  /** Update helpers --------------------------------------------------- */
  setPrediction: (roundIdx: number, playerIdx: number, value: number) => void;
  setActual: (roundIdx: number, playerIdx: number, value: number) => void;
  setScoreChange: (roundIdx: number, playerIdx: number, value: number) => void;

  /** Current round helpers --------------------------------------------- */
  currentRound: number; // index of the currently active round
  setCurrentRound: (roundIdx: number) => void; // new setter
}

export const ScoreboardContext = createContext<ScoreboardContextProps | undefined>(undefined);

/** ------------------------------------------------------------------
 *  Provider component
 * ------------------------------------------------------------------ */
export const ScoreboardProvider: FunctionComponent<{
  players: Array<string>;
  children?: ReactNode;
}> = ({ players, children }) => {
  // ---- number of rounds ------------------------------------------------
  const roundCount = Math.ceil(60 / players.length);

  // ---- helper to create an empty round -------------------------------
  const makeEmptyRound = (id: number): RoundData => ({
    id,
    predictions: Array(players.length).fill(undefined),
    actuals: Array(players.length).fill(undefined),
    scoreChanges: Array(players.length).fill(undefined),
  });

  // ---- state ----------------------------------------------------------
  const [rounds, setRounds] = useState<Array<RoundData>>(Array.from({ length: roundCount }, (_, i) => makeEmptyRound(i)));
  const [currentRound, setCurrentRound] = useState(0);

  // ---- update helpers --------------------------------------------------
  const setPrediction = (roundIdx: number, playerIdx: number, value: number) => {
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundIdx
          ? {
              ...r,
              predictions: r.predictions.map((p, i) => (i === playerIdx ? value : p)),
            }
          : r,
      ),
    );
  };

  const setActual = (roundIdx: number, playerIdx: number, value: number) => {
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundIdx
          ? {
              ...r,
              actuals: r.actuals.map((a, i) => (i === playerIdx ? value : a)),
            }
          : r,
      ),
    );
  };

  const setScoreChange = (roundIdx: number, playerIdx: number, value: number) => {
    setRounds((prev) =>
      prev.map((r) =>
        r.id === roundIdx
          ? {
              ...r,
              scoreChanges: r.scoreChanges.map((s, i) => (i === playerIdx ? value : s)),
            }
          : r,
      ),
    );
  };

  // ---- compute global scores -------------------------------------------
  const scores = rounds.reduce((acc, r) => {
    r.scoreChanges.forEach((sc, i) => (sc ? (acc[i] += sc) : undefined));
    return acc;
  }, Array(players.length).fill(0));

  // ---- context value ---------------------------------------------------
  const ctx: ScoreboardContextProps = {
    players,
    rounds,
    scores,
    roundCount,
    setPrediction,
    setActual,
    setScoreChange,
    currentRound,
    setCurrentRound,
  };

  return <ScoreboardContext.Provider value={ctx}>{children}</ScoreboardContext.Provider>;
};
