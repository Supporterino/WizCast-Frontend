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

export interface StoredGame {
  id: string;
  startDate: Date;
  endDate?: Date;
  location: string;
  players: Array<string>;
  rules: Array<Rule>;
  rounds: Array<RoundData>;
  scores: Array<number>;
}

export interface GameOverview {
  id: string;
  playerCount: number;
  startDate: Date;
  endDate?: Date;
  location: string;
}

export type InputSource = 'host' | 'remote';

export type SlotStatus = 'unclaimed' | 'claimed' | 'disconnected';

export interface PlayerSlot {
  playerIndex: number;
  playerName: string;
  inputSource: InputSource;
  slotStatus: SlotStatus;
  clientId?: string;
}
