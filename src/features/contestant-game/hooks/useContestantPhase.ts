import { useCallback, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { RoundData, Rule, SlotStatus } from '@/types/game.ts';

export type AppState =
  | { phase: 'enter-code' }
  | { phase: 'claim-slot'; joinCode: string; players: Array<string>; slotStatuses: Array<SlotStatus>; sessionToken: string }
  | {
      phase: 'playing';
      joinCode: string;
      sessionToken: string;
      claimedIndex: number;
      matchState: { players: Array<string>; rounds: Array<RoundData>; scores: Array<number>; rules: Array<Rule>; currentRound: number };
    }
  | {
      phase: 'round-summary';
      joinCode: string;
      sessionToken: string;
      claimedIndex: number;
      matchState: { players: Array<string>; rounds: Array<RoundData>; scores: Array<number>; rules: Array<Rule>; currentRound: number };
      roundIndex: number;
      scoreChanges: Array<number>;
    };

export function useContestantPhase() {
  const [appState, setAppState] = useState<AppState>({ phase: 'enter-code' });
  const [claimError, setClaimError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [sendError, setSendError] = useState(false);
  const [hostDisconnected, setHostDisconnected] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [localPrediction, setLocalPrediction] = useState<number | undefined>(undefined);
  const [localActual, setLocalActual] = useState<number | undefined>(undefined);

  const appStateRef = useRef(appState);
  appStateRef.current = appState;

  const hostDisconnectedRef = useRef(false);
  hostDisconnectedRef.current = hostDisconnected;

  const latestPredRef = useRef<number | undefined>(undefined);
  const latestActualRef = useRef<number | undefined>(undefined);

  const resetScoreRefs = useCallback(() => {
    latestPredRef.current = undefined;
    latestActualRef.current = undefined;
    setLocalPrediction(undefined);
    setLocalActual(undefined);
  }, []);

  const setAppStateSafe: Dispatch<SetStateAction<AppState>> = setAppState;

  return {
    appState,
    setAppState: setAppStateSafe,
    appStateRef,
    claimError,
    setClaimError,
    joinError,
    setJoinError,
    sendError,
    setSendError,
    hostDisconnected,
    setHostDisconnected,
    hostDisconnectedRef,
    sessionExpired,
    setSessionExpired,
    localPrediction,
    setLocalPrediction,
    localActual,
    setLocalActual,
    latestPredRef,
    latestActualRef,
    resetScoreRefs,
  };
}
