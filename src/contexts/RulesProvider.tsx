import { createContext, useState } from 'react';
import type { Dispatch, FunctionComponent, ReactNode, SetStateAction } from 'react';

export interface Rule {
  name: string;
  description: string;
  active: boolean;
}

export interface RulesContextProps {
  rules: Array<Rule>;
  setRules: Dispatch<SetStateAction<Array<Rule>>>;
  toggleRule: (index: number) => void;
}

export const RulesContext = createContext<RulesContextProps | undefined>(undefined);

const defaultRules: Array<Rule> = [
  {
    name: 'No matching prediction',
    description: 'Players are not allowed to set predictions equal to the number of hits per round.',
    active: true,
  },
];

export const RulesProvider: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
  const [rules, setRules] = useState<Array<Rule>>(defaultRules);

  const toggleRule = (index: number) => {
    setRules((prev) => prev.map((r, i) => (i === index ? { ...r, active: !r.active } : r)));
  };

  return <RulesContext.Provider value={{ rules, setRules, toggleRule }}>{children}</RulesContext.Provider>;
};
