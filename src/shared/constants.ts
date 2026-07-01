import type { SlotStatus } from '@/types/game.ts';

export const ERROR_CODES = {
  INCOMPLETE_PREDICTIONS: 'INCOMPLETE_PREDICTIONS',
  INCOMPLETE_ACTUALS: 'INCOMPLETE_ACTUALS',
  TOO_MANY_PREDICTIONS: 'TOO_MANY_PREDICTIONS',
  NO_MATCHING_PREDICTION: 'NO_MATCHING_PREDICTION',
  INVALID_ACTUALS_TOTAL: 'INVALID_ACTUALS_TOTAL',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  HOST_SESSION_EXPIRED: 'HOST_SESSION_EXPIRED',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const SLOT_STATUS_COLORS: Record<SlotStatus, string> = {
  unclaimed: 'gray',
  claimed: 'green',
  disconnected: 'orange',
};

export const GAME_DEFAULTS = {
  MIN_PLAYERS: 2,
  MAX_PLAYERS: 6,
  DEFAULT_PLAYER_COUNT: 3,
  TOTAL_TRICKS: 60,
} as const;
