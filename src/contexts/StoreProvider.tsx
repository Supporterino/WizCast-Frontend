import { createContext, useEffect, useMemo, useState } from 'react';
import type { Dispatch, FunctionComponent, ReactNode, SetStateAction } from 'react';
import type { GameOverview, StoredGame } from '@/types/game.ts';
import { loadGames, saveGames } from '@/shared/services/tauri/store.ts';

export type { GameOverview, StoredGame } from '@/types/game.ts';

export interface StoreContextProps {
  completedGames: Array<StoredGame>;
  setCompletedGames: Dispatch<SetStateAction<Array<StoredGame>>>;
  getGameById: (id: string) => StoredGame | undefined;
  deleteGameById: (id: string) => void;
  gameOverview: Array<GameOverview>;
}

export const StoreContext = createContext<StoreContextProps | undefined>(undefined);

export const StoreProvider: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
  const [completedGames, setCompletedGames] = useState<Array<StoredGame>>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const games = await loadGames();
      setCompletedGames(games);
      setLoaded(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveGames(completedGames);
  }, [completedGames, loaded]);

  const getGameById = (id: string) => completedGames.find((g) => g.id === id);

  const deleteGameById = (id: string) => {
    setCompletedGames((prev) => prev.filter((g) => g.id !== id));
  };

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

  return (
    <StoreContext.Provider
      value={{
        completedGames,
        setCompletedGames,
        getGameById,
        deleteGameById,
        gameOverview,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};
