import { createContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Dispatch, FunctionComponent, ReactNode, SetStateAction } from 'react';

export interface Rule {
  name: string;
  description: string;
  active: boolean;
}

export interface RoundData {
  id: number;
  predictions: Array<number | undefined>;
  actuals: Array<number | undefined>;
  scoreChanges: Array<number | undefined>;
}

export interface GameContextProps {
  id: string;
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  location: string;
  setLocation: (loc: string) => void;

  players: Array<string>;
  setPlayers: Dispatch<SetStateAction<Array<string>>>;

  rules: Array<Rule>;
  setRules: Dispatch<SetStateAction<Array<Rule>>>;
  toggleRule: (index: number) => void;

  rounds: Array<RoundData>;
  scores: Array<number>;
  roundCount: number;
  currentRound: number;
  setCurrentRound: Dispatch<SetStateAction<number>>;
  playingRound: number;
  setPlayingRound: Dispatch<SetStateAction<number>>;

  setPrediction: (roundIdx: number, playerIdx: number, value: number) => void;
  setActual: (roundIdx: number, playerIdx: number, value: number) => void;
  setScoreChange: (roundIdx: number, playerIdx: number, value: number) => void;
  updatePlayers: (newPlayers: Array<string>) => void;

  endGame: () => void;
  startGame: () => void;
}

export const GameContext = createContext<GameContextProps | undefined>(undefined);

export const GameProvider: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  const getDefaultRules = (): Array<Rule> => [
    {
      name: t('rule.noMatchingPrediction.name'),
      description: t('rule.noMatchingPrediction.description'),
      active: true,
    },
  ];

  const [gameId, setGameId] = useState<string>(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const [active, setActive] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [location, setLocation] = useState<string>('');

  const [players, setPlayers] = useState<Array<string>>(Array(3).fill(''));

  const [rules, setRules] = useState<Array<Rule>>(getDefaultRules());
  const [roundCount, setRoundCount] = useState(Math.ceil(60 / players.length));

  const makeEmptyRound = (id: number): RoundData => ({
    id,
    predictions: Array(players.length).fill(undefined),
    actuals: Array(players.length).fill(undefined),
    scoreChanges: Array(players.length).fill(undefined),
  });

  const [rounds, setRounds] = useState<Array<RoundData>>(Array.from({ length: roundCount }, (_, i) => makeEmptyRound(i)));
  const [currentRound, setCurrentRound] = useState(0);
  const [playingRound, setPlayingRound] = useState(0);

  /* ------------------------------------------------------------------ */
  /*  State‑updating helpers                                           */
  /* ------------------------------------------------------------------ */
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

  const scores = rounds.reduce((acc, r) => {
    r.scoreChanges.forEach((sc, i) => (sc ? (acc[i] += sc) : undefined));
    return acc;
  }, Array(players.length).fill(0));

  const toggleRule = (index: number) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, active: !r.active } : r)));
  };

  const updatePlayers = (newPlayers: Array<string>) => {
    setPlayers(newPlayers);
    setRoundCount(Math.ceil(60 / newPlayers.length));
    setRounds(Array.from({ length: Math.ceil(60 / newPlayers.length) }, (_, i) => makeEmptyRound(i)));
  };

  const endGame = () => {
    setActive(false);
    setGameId(typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    setStartDate(undefined);
    setEndDate(undefined);

    setPlayers(Array(3).fill(''));
    setRules(getDefaultRules());

    setCurrentRound(0);
    setPlayingRound(0);
  };

  const startGame = () => {
    setStartDate(new Date());
    setActive(true);
  };

  /* ------------------------------------------------------------------ */
  /*  Context value                                                    */
  /* ------------------------------------------------------------------ */
  const ctx: GameContextProps = {
    id: gameId,
    active,
    startDate,
    endDate,
    location,
    setLocation,

    players,
    setPlayers,

    rules,
    setRules,
    rounds,
    scores,
    roundCount,
    currentRound,
    setCurrentRound,
    playingRound,
    setPlayingRound,

    setPrediction,
    setActual,
    setScoreChange,
    updatePlayers,

    endGame,
    startGame,
    toggleRule,
  };

  return <GameContext.Provider value={ctx}>{children}</GameContext.Provider>;
};
