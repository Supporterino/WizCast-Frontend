import { createContext, useEffect, useMemo, useState } from 'react';
import { LazyStore } from '@tauri-apps/plugin-store';
import type { Dispatch, FunctionComponent, ReactNode, SetStateAction } from 'react';

export interface StoredGame {
  id: string;
  startDate: Date;
  endDate?: Date;
  location: string;

  players: Array<string>;

  rules: Array<{
    name: string;
    description: string;
    active: boolean;
  }>;

  rounds: Array<{
    id: number;
    predictions: Array<number | undefined>;
    actuals: Array<number | undefined>;
    scoreChanges: Array<number | undefined>;
  }>;

  scores: Array<number>;
}

export interface GameOverview {
  id: string;
  playerCount: number;
  startDate: Date;
  endDate?: Date;
  location: string;
}

export interface StoreContextProps {
  completedGames: Array<StoredGame>;
  setCompletedGames: Dispatch<SetStateAction<Array<StoredGame>>>;
  getGameById: (id: string) => StoredGame | undefined;
  gameOverview: Array<GameOverview>;
}

export const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
  const [completedGames, setCompletedGames] = useState<Array<StoredGame>>([]);

  useEffect(() => {
    const init = async () => {
      try {
        const store = new LazyStore('games.json');
        const stored = await store.get<{ value: Array<StoredGame> }>('completedGames');
        if (stored && Array.isArray(stored.value)) {
          setCompletedGames(stored.value);
        }
      } catch (e) {
        console.error('StoreProvider: failed to load store', e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const persist = async () => {
      try {
        const store = new LazyStore('games.json');
        await store.set('completedGames', { value: completedGames });
        await store.save();
      } catch (e) {
        console.error('StoreProvider: failed to save store', e);
      }
    };
    persist();
  }, [completedGames]);

  const getGameById = (id: string) => completedGames.find((g) => g.id === id);

  const gameOverview = useMemo(
    () =>
      completedGames.map((g) => ({
        id: g.id,
        playerCount: g.players.length,
        startDate: g.startDate,
        endDate: g.endDate,
        location: g.location,
      })),
    [completedGames],
  );

  return <StoreContext.Provider value={{ completedGames, setCompletedGames, gameOverview, getGameById }}>{children}</StoreContext.Provider>;
};
