import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Dispatch, FunctionComponent, ReactNode, SetStateAction } from 'react';
import type { PlayerSlot, RoundData, Rule } from '@/types/game.ts';

export type { RoundData, Rule } from '@/types/game.ts';

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

  playerSlots: Array<PlayerSlot>;
  setPlayerSlot: (playerIndex: number, updates: Partial<PlayerSlot>) => void;
  updateSlotStatus: (playerIndex: number, status: PlayerSlot['slotStatus']) => void;

  endGame: () => void;
  startGame: () => void;
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */
export const GameContext = createContext<GameContextProps | undefined>(undefined);

/* ------------------------------------------------------------------ */
/*  Provider                                                            */
/* ------------------------------------------------------------------ */
export const GameProvider: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

  /* ---------- Default rules (memoised) --------------------------- */
  const getDefaultRules = useCallback(
    (): Array<Rule> => [
      {
        name: t('rule.noMatchingPrediction.name'),
        description: t('rule.noMatchingPrediction.description'),
        active: true,
      },
    ],
    [t],
  );

  /* ---------- State ------------------------------------------------ */
  const [gameId, setGameId] = useState<string>(() =>
    typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const [active, setActive] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [location, setLocation] = useState<string>('');
  const [players, setPlayers] = useState<Array<string>>(Array(3).fill(''));
  const [rules, setRules] = useState<Array<Rule>>(getDefaultRules());
  const [currentRound, setCurrentRound] = useState(0);
  const [playingRound, setPlayingRound] = useState(0);

  /* ---------- Derived state --------------------------------------- */
  const roundCount = useMemo(() => Math.ceil(60 / players.length), [players.length]);

  /* ---------- Helper for an empty round -------------------------- */
  const makeEmptyRound = useCallback(
    (id: number, length: number): RoundData => ({
      id,
      predictions: Array(length).fill(undefined),
      actuals: Array(length).fill(undefined),
      scoreChanges: Array(length).fill(undefined),
    }),
    [],
  );

  /* ---------- Rounds state ---------------------------------------- */
  const [rounds, setRounds] = useState<Array<RoundData>>(Array.from({ length: roundCount }, (_, i) => makeEmptyRound(i, players.length)));

  /* ---------- Player slots state ---------------------------------- */
  const [playerSlots, setPlayerSlots] = useState<Array<PlayerSlot>>([]);

  const setPlayerSlot = useCallback((playerIndex: number, updates: Partial<PlayerSlot>) => {
    setPlayerSlots((prev) => prev.map((slot) => (slot.playerIndex === playerIndex ? { ...slot, ...updates } : slot)));
  }, []);

  const updateSlotStatus = useCallback((playerIndex: number, status: PlayerSlot['slotStatus']) => {
    setPlayerSlots((prev) => prev.map((slot) => (slot.playerIndex === playerIndex ? { ...slot, slotStatus: status } : slot)));
  }, []);

  /* ---------- Keep rounds in sync with player count ---------------- */
  useEffect(() => {
    setRounds(Array.from({ length: roundCount }, (_, i) => makeEmptyRound(i, players.length)));
  }, [roundCount, players.length, makeEmptyRound]);

  /* ---------- Keep player slots in sync with players --------------- */
  useEffect(() => {
    setPlayerSlots((prev) => {
      if (prev.length === players.length) return prev;
      return players.map((name, i) => {
        const existing = prev.find((s) => s.playerIndex === i);
        return existing ?? { playerIndex: i, playerName: name, inputSource: 'host', slotStatus: 'unclaimed' };
      });
    });
  }, [players]);

  /* ---------- Scores (derived) ------------------------------------ */
  const scores = useMemo(() => {
    return rounds.reduce((acc, r) => {
      r.scoreChanges.forEach((sc, i) => (sc ? (acc[i] += sc) : undefined));
      return acc;
    }, Array(players.length).fill(0));
  }, [rounds, players.length]);

  /* ---------- Mutator helpers ------------------------------------- */
  const setPrediction = useCallback((roundIdx: number, playerIdx: number, value: number) => {
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
  }, []);

  const setActual = useCallback((roundIdx: number, playerIdx: number, value: number) => {
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
  }, []);

  const setScoreChange = useCallback((roundIdx: number, playerIdx: number, value: number) => {
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
  }, []);

  const toggleRule = useCallback(
    (index: number) => setRules((prev) => prev.map((r, i) => (i === index ? { ...r, active: !r.active } : r))),
    [],
  );

  const endGame = useCallback(() => {
    setActive(false);
    setGameId(typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);
    setStartDate(undefined);
    setEndDate(undefined);

    // Reset to defaults
    const defaultPlayers = Array(3).fill('');
    setPlayers(defaultPlayers);
    setRules(getDefaultRules());

    setCurrentRound(0);
    setPlayingRound(0);
  }, [getDefaultRules]);

  const startGame = useCallback(() => {
    setStartDate(new Date());
    setActive(true);
  }, []);

  /* ---------- Memoised context value ----------------------------- */
  const ctx: GameContextProps = useMemo(
    () => ({
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

      playerSlots,
      setPlayerSlot,
      updateSlotStatus,

      endGame,
      startGame,
      toggleRule,
    }),
    [
      gameId,
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

      playerSlots,
      setPlayerSlot,
      updateSlotStatus,

      endGame,
      startGame,
      toggleRule,
    ],
  );

  return <GameContext.Provider value={ctx}>{children}</GameContext.Provider>;
};
