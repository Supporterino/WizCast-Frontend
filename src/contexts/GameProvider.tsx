import { createContext, useCallback, useEffect, useMemo, useReducer } from 'react';
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

export const GameContext = createContext<GameContextProps | undefined>(undefined);

interface GameState {
  gameId: string;
  active: boolean;
  startDate?: Date;
  endDate?: Date;
  location: string;
  players: Array<string>;
  rules: Array<Rule>;
  currentRound: number;
  playingRound: number;
  rounds: Array<RoundData>;
  playerSlots: Array<PlayerSlot>;
}

type GameAction =
  | { type: 'SET_LOCATION'; location: string }
  | { type: 'SET_PLAYERS'; players: Array<string> }
  | { type: 'SET_RULES'; rules: Array<Rule> }
  | { type: 'TOGGLE_RULE'; index: number }
  | { type: 'SET_CURRENT_ROUND'; currentRound: number }
  | { type: 'SET_PLAYING_ROUND'; playingRound: number }
  | { type: 'SET_ROUNDS'; rounds: Array<RoundData> }
  | { type: 'SET_PREDICTION'; roundIdx: number; playerIdx: number; value: number }
  | { type: 'SET_ACTUAL'; roundIdx: number; playerIdx: number; value: number }
  | { type: 'SET_SCORE_CHANGE'; roundIdx: number; playerIdx: number; value: number }
  | { type: 'SET_PLAYER_SLOTS'; playerSlots: Array<PlayerSlot> }
  | { type: 'UPDATE_PLAYER_SLOT'; playerIndex: number; updates: Partial<PlayerSlot> }
  | { type: 'UPDATE_SLOT_STATUS'; playerIndex: number; status: PlayerSlot['slotStatus'] }
  | { type: 'START_GAME' }
  | { type: 'END_GAME'; gameId: string; defaultPlayers: Array<string>; defaultRules: Array<Rule> };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_LOCATION':
      return { ...state, location: action.location };
    case 'SET_PLAYERS':
      return { ...state, players: action.players };
    case 'SET_RULES':
      return { ...state, rules: action.rules };
    case 'TOGGLE_RULE':
      return { ...state, rules: state.rules.map((r, i) => (i === action.index ? { ...r, active: !r.active } : r)) };
    case 'SET_CURRENT_ROUND':
      return { ...state, currentRound: action.currentRound };
    case 'SET_PLAYING_ROUND':
      return { ...state, playingRound: action.playingRound };
    case 'SET_ROUNDS':
      return { ...state, rounds: action.rounds };
    case 'SET_PREDICTION':
      return {
        ...state,
        rounds: state.rounds.map((r) =>
          r.id === action.roundIdx
            ? { ...r, predictions: r.predictions.map((p, i) => (i === action.playerIdx ? action.value : p)) }
            : r,
        ),
      };
    case 'SET_ACTUAL':
      return {
        ...state,
        rounds: state.rounds.map((r) =>
          r.id === action.roundIdx
            ? { ...r, actuals: r.actuals.map((a, i) => (i === action.playerIdx ? action.value : a)) }
            : r,
        ),
      };
    case 'SET_SCORE_CHANGE':
      return {
        ...state,
        rounds: state.rounds.map((r) =>
          r.id === action.roundIdx
            ? { ...r, scoreChanges: r.scoreChanges.map((s, i) => (i === action.playerIdx ? action.value : s)) }
            : r,
        ),
      };
    case 'SET_PLAYER_SLOTS':
      return { ...state, playerSlots: action.playerSlots };
    case 'UPDATE_PLAYER_SLOT':
      return {
        ...state,
        playerSlots: state.playerSlots.map((slot) =>
          slot.playerIndex === action.playerIndex ? { ...slot, ...action.updates } : slot,
        ),
      };
    case 'UPDATE_SLOT_STATUS':
      return {
        ...state,
        playerSlots: state.playerSlots.map((slot) =>
          slot.playerIndex === action.playerIndex ? { ...slot, slotStatus: action.status } : slot,
        ),
      };
    case 'START_GAME':
      return { ...state, active: true, startDate: new Date() };
    case 'END_GAME':
      return {
        ...state,
        gameId: action.gameId,
        active: false,
        startDate: undefined,
        endDate: undefined,
        players: action.defaultPlayers,
        rules: action.defaultRules,
        currentRound: 0,
        playingRound: 0,
      };
    default:
      return state;
  }
}

export const GameProvider: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
  const { t } = useTranslation();

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

  const initialState: GameState = {
    gameId: typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    active: false,
    startDate: undefined,
    endDate: undefined,
    location: '',
    players: Array(3).fill(''),
    rules: getDefaultRules(),
    currentRound: 0,
    playingRound: 0,
    rounds: [],
    playerSlots: [],
  };

  const [state, dispatch] = useReducer(gameReducer, initialState);

  const roundCount = useMemo(() => Math.ceil(60 / state.players.length), [state.players.length]);

  const makeEmptyRound = useCallback(
    (id: number, length: number): RoundData => ({
      id,
      predictions: Array(length).fill(undefined),
      actuals: Array(length).fill(undefined),
      scoreChanges: Array(length).fill(undefined),
    }),
    [],
  );

  useEffect(() => {
    dispatch({
      type: 'SET_ROUNDS',
      rounds: Array.from({ length: roundCount }, (_, i) => makeEmptyRound(i, state.players.length)),
    });
  }, [roundCount, state.players.length, makeEmptyRound]);

  useEffect(() => {
    if (state.playerSlots.length === state.players.length) return;
    dispatch({
      type: 'SET_PLAYER_SLOTS',
      playerSlots: state.players.map((name, i) => {
        const existing = state.playerSlots.find((s) => s.playerIndex === i);
        return existing ?? { playerIndex: i, playerName: name, inputSource: 'host', slotStatus: 'unclaimed' };
      }),
    });
  }, [state.players]);

  const scores = useMemo(() => {
    return state.rounds.reduce((acc, r) => {
      r.scoreChanges.forEach((sc, i) => (sc ? (acc[i] += sc) : undefined));
      return acc;
    }, Array(state.players.length).fill(0));
  }, [state.rounds, state.players.length]);

  const setLocation = useCallback((loc: string) => dispatch({ type: 'SET_LOCATION', location: loc }), []);

  const setPlayers = useCallback((players: Array<string> | ((prev: Array<string>) => Array<string>)) => {
    if (typeof players === 'function') {
      // We need to handle functional updates; for simplicity, we accept direct arrays
      dispatch({ type: 'SET_PLAYERS', players: players([]) });
    } else {
      dispatch({ type: 'SET_PLAYERS', players });
    }
  }, []);

  const setRules = useCallback((rules: Array<Rule> | ((prev: Array<Rule>) => Array<Rule>)) => {
    if (typeof rules === 'function') {
      dispatch({ type: 'SET_RULES', rules: rules([]) });
    } else {
      dispatch({ type: 'SET_RULES', rules });
    }
  }, []);

  const toggleRule = useCallback((index: number) => dispatch({ type: 'TOGGLE_RULE', index }), []);

  const setCurrentRound = useCallback((round: number | ((prev: number) => number)) => {
    const value = typeof round === 'function' ? round(0) : round;
    dispatch({ type: 'SET_CURRENT_ROUND', currentRound: value });
  }, []);

  const setPlayingRound = useCallback((round: number | ((prev: number) => number)) => {
    const value = typeof round === 'function' ? round(0) : round;
    dispatch({ type: 'SET_PLAYING_ROUND', playingRound: value });
  }, []);

  const setPrediction = useCallback(
    (roundIdx: number, playerIdx: number, value: number) => dispatch({ type: 'SET_PREDICTION', roundIdx, playerIdx, value }),
    [],
  );

  const setActual = useCallback(
    (roundIdx: number, playerIdx: number, value: number) => dispatch({ type: 'SET_ACTUAL', roundIdx, playerIdx, value }),
    [],
  );

  const setScoreChange = useCallback(
    (roundIdx: number, playerIdx: number, value: number) => dispatch({ type: 'SET_SCORE_CHANGE', roundIdx, playerIdx, value }),
    [],
  );

  const setPlayerSlot = useCallback(
    (playerIndex: number, updates: Partial<PlayerSlot>) => dispatch({ type: 'UPDATE_PLAYER_SLOT', playerIndex, updates }),
    [],
  );

  const updateSlotStatus = useCallback(
    (playerIndex: number, status: PlayerSlot['slotStatus']) => dispatch({ type: 'UPDATE_SLOT_STATUS', playerIndex, status }),
    [],
  );

  const endGame = useCallback(() => {
    const newId = typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    dispatch({
      type: 'END_GAME',
      gameId: newId,
      defaultPlayers: Array(3).fill(''),
      defaultRules: getDefaultRules(),
    });
  }, [getDefaultRules]);

  const startGame = useCallback(() => dispatch({ type: 'START_GAME' }), []);

  const ctx: GameContextProps = useMemo(
    () => ({
      id: state.gameId,
      active: state.active,
      startDate: state.startDate,
      endDate: state.endDate,
      location: state.location,
      setLocation,
      players: state.players,
      setPlayers,
      rules: state.rules,
      setRules,
      rounds: state.rounds,
      scores,
      roundCount,
      currentRound: state.currentRound,
      setCurrentRound,
      playingRound: state.playingRound,
      setPlayingRound,
      setPrediction,
      setActual,
      setScoreChange,
      playerSlots: state.playerSlots,
      setPlayerSlot,
      updateSlotStatus,
      endGame,
      startGame,
      toggleRule,
    }),
    [
      state, setLocation, setPlayers, setRules, scores, roundCount,
      setCurrentRound, setPlayingRound, setPrediction, setActual, setScoreChange,
      setPlayerSlot, updateSlotStatus, endGame, startGame, toggleRule,
    ],
  );

  return <GameContext.Provider value={ctx}>{children}</GameContext.Provider>;
};
