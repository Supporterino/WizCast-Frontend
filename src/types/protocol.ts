export type SlotStatus = 'unclaimed' | 'claimed' | 'disconnected';

export enum ErrorCode {
  INVALID_CODE = 'INVALID_CODE',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  SLOT_ALREADY_CLAIMED = 'SLOT_ALREADY_CLAIMED',
  INVALID_SLOT = 'INVALID_SLOT',
  INCOMPLETE_PREDICTIONS = 'INCOMPLETE_PREDICTIONS',
  INVALID_ACTUALS_TOTAL = 'INVALID_ACTUALS_TOTAL',
  RULE_VIOLATION = 'RULE_VIOLATION',
}

// === Client → Relay payloads ===

export interface JoinRoomPayload {
  joinCode: string; // XXX-XXX format (e.g. "123-456"), hyphen is part of the string
  sessionToken?: string;
}

export interface ClaimSlotPayload {
  playerIndex: number;
}

export interface SubmitScorePayload {
  playerIndex: number;
  roundIndex: number;
  predictions: Array<number>;
  actuals: Array<number>;
}

export interface CreateRoomPayload {
  matchState: unknown;
}

export interface CloseRoomPayload {}

export interface ReleaseSlotPayload {
  playerIndex: number;
}

export interface StateSyncPayload {
  matchState: unknown;
}

export interface RoundCompletedPayload {
  roundIndex: number;
  scoreChanges: Array<number>;
  players: Array<string>;
}

export type ClientToRelayPayload =
  | JoinRoomPayload
  | ClaimSlotPayload
  | SubmitScorePayload
  | CreateRoomPayload
  | CloseRoomPayload
  | ReleaseSlotPayload
  | StateSyncPayload
  | RoundCompletedPayload;

// === Relay → Client payloads ===

export interface RoomCreatedPayload {
  joinCode: string; // XXX-XXX format (e.g. "123-456")
}

export interface RoomJoinedPayload {
  matchState: unknown;
  players: Array<string>;
  slotStatuses: Array<SlotStatus>;
  sessionToken: string;
}

export interface SlotClaimedPayload {
  playerIndex: number;
}

export interface SlotReleasedPayload {
  playerIndex: number;
}

export interface SlotStatusChangedPayload {
  playerIndex: number;
  status: SlotStatus;
}

export interface RoomClosedPayload {}

export interface ErrorPayload {
  code: ErrorCode;
  message: string;
}

export interface ScoreSubmittedPayload {
  playerIndex: number;
  roundIndex: number;
  predictions: Array<number>;
  actuals: Array<number>;
}

export interface ContestantJoinedPayload {
  clientId: string;
}

export interface ContestantLeftPayload {
  clientId: string;
  playerIndex: number;
}

export type RelayToClientPayload =
  | RoomCreatedPayload
  | RoomJoinedPayload
  | SlotClaimedPayload
  | SlotReleasedPayload
  | SlotStatusChangedPayload
  | RoomClosedPayload
  | ErrorPayload
  | ScoreSubmittedPayload
  | ContestantJoinedPayload
  | ContestantLeftPayload
  | StateSyncPayload
  | RoundCompletedPayload;

// === Envelope types ===

export interface ClientToRelayEnvelope {
  event: string;
  data: ClientToRelayPayload;
}

export type RelayToClientEnvelope =
  | { event: 'room-created'; data: RoomCreatedPayload }
  | { event: 'room-joined'; data: RoomJoinedPayload }
  | { event: 'slot-claimed'; data: SlotClaimedPayload }
  | { event: 'slot-released'; data: SlotReleasedPayload }
  | { event: 'slot-status-changed'; data: SlotStatusChangedPayload }
  | { event: 'room-closed'; data: RoomClosedPayload }
  | { event: 'error'; data: ErrorPayload }
  | { event: 'score-submitted'; data: ScoreSubmittedPayload }
  | { event: 'contestant-joined'; data: ContestantJoinedPayload }
  | { event: 'contestant-left'; data: ContestantLeftPayload }
  | { event: 'state-sync'; data: StateSyncPayload }
  | { event: 'round-completed'; data: RoundCompletedPayload };
