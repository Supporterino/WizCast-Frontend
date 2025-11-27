import { createContext, useState } from 'react';
import type { Dispatch, FunctionComponent, ReactNode, SetStateAction } from 'react';

export interface PlayersContextProps {
  players: Array<string>;
  setPlayers: Dispatch<SetStateAction<Array<string>>>;
}

export const PlayersContext = createContext<PlayersContextProps | undefined>(undefined);

/** Provider component that holds the state */
export const PlayersProvider: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
  // initialise with three empty names – the same default you use in the form
  const [players, setPlayers] = useState<Array<string>>(Array(3).fill(''));

  return <PlayersContext.Provider value={{ players, setPlayers }}>{children}</PlayersContext.Provider>;
};
