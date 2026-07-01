import { useCallback, useEffect, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import type { Dispatch, MutableRefObject, SetStateAction } from 'react';
import type { RelayToClientEnvelope } from '@/types/protocol.ts';
import type { ConnectionContextValue } from '@/contexts/ConnectionProvider.tsx';
import type { AppState } from './useContestantPhase.ts';
import { useDebounce } from '@/shared/hooks/useDebounce.ts';
import { ErrorCode } from '@/types/protocol.ts';

interface UseContestantEventsParams {
  conn: ConnectionContextValue;
  appStateRef: MutableRefObject<AppState>;
  setAppState: Dispatch<SetStateAction<AppState>>;
  latestPredRef: MutableRefObject<number | undefined>;
  latestActualRef: MutableRefObject<number | undefined>;
  resetScoreRefs: () => void;
  setHostDisconnected: Dispatch<SetStateAction<boolean>>;
  setClaimError: Dispatch<SetStateAction<string | null>>;
  setJoinError: Dispatch<SetStateAction<string | null>>;
  setSendError: Dispatch<SetStateAction<boolean>>;
  setSessionExpired: Dispatch<SetStateAction<boolean>>;
}

export function useContestantEvents({
  conn,
  appStateRef,
  setAppState,
  latestPredRef,
  latestActualRef,
  resetScoreRefs,
  setHostDisconnected,
  setClaimError,
  setJoinError,
  setSendError,
  setSessionExpired,
}: UseContestantEventsParams) {
  const { t } = useTranslation();

  const joinCodeRef = useRef<string | null>(null);
  const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const summaryDismissRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleMessage = useCallback((message: RelayToClientEnvelope) => {
    setAppState((current) => {
      switch (message.event) {
        case 'room-joined': {
          if (joinTimeoutRef.current) {
            clearTimeout(joinTimeoutRef.current);
            joinTimeoutRef.current = null;
          }
          conn.setSessionJoined();
          return {
            phase: 'claim-slot',
            joinCode: joinCodeRef.current ?? '',
            players: message.data.players,
            slotStatuses: message.data.slotStatuses,
            sessionToken: message.data.sessionToken,
          };
        }
        case 'slot-claimed': {
          if (current.phase === 'claim-slot') {
            resetScoreRefs();
            conn.setSessionActive();
            return {
              phase: 'playing',
              joinCode: current.joinCode,
              sessionToken: current.sessionToken,
              claimedIndex: message.data.playerIndex,
              matchState: { players: current.players, rounds: [], scores: new Array(current.players.length).fill(0), rules: [], currentRound: 0 },
            };
          }
          return current;
        }
        case 'slot-status-changed': {
          if (current.phase === 'claim-slot') {
            const newSlotStatuses = [...current.slotStatuses];
            newSlotStatuses[message.data.playerIndex] = message.data.status;
            return { ...current, slotStatuses: newSlotStatuses };
          }
          return current;
        }
        case 'state-sync': {
          if (current.phase === 'playing' || current.phase === 'round-summary') {
            resetScoreRefs();
            return { ...current, matchState: message.data.matchState as typeof current.matchState };
          }
          return current;
        }
        case 'round-completed': {
          if (current.phase === 'playing') {
            resetScoreRefs();
            if (summaryDismissRef.current) clearTimeout(summaryDismissRef.current);
            return {
              phase: 'round-summary',
              joinCode: current.joinCode,
              sessionToken: current.sessionToken,
              claimedIndex: current.claimedIndex,
              matchState: current.matchState,
              roundIndex: message.data.roundIndex,
              scoreChanges: message.data.scoreChanges,
            };
          }
          return current;
        }
        case 'host-disconnected': {
          setHostDisconnected(true);
          return current;
        }
        case 'host-reconnected': {
          setHostDisconnected(false);
          return current;
        }
        case 'slot-released': {
          if (current.phase === 'playing') {
            notifications.show({
              title: t('join.slotReleasedTitle', 'Slot Released'),
              message: t('join.slotReleasedMessage', 'Your slot was released by the host'),
              color: 'orange',
              autoClose: 5000,
            });
            resetScoreRefs();
            const slotStatuses = current.matchState.players.map((_, idx) =>
              idx === message.data.playerIndex ? 'unclaimed' : 'claimed'
            );
            return {
              phase: 'claim-slot',
              joinCode: current.joinCode,
              players: current.matchState.players,
              slotStatuses,
              sessionToken: current.sessionToken,
            };
          }
          return current;
        }
        case 'room-closed':
          conn.setSessionDisconnected();
          setHostDisconnected(false);
          return { phase: 'enter-code' };
        case 'error': {
          if (joinTimeoutRef.current) {
            clearTimeout(joinTimeoutRef.current);
            joinTimeoutRef.current = null;
          }
          if (message.data.code === ErrorCode.SESSION_EXPIRED || message.data.code === ErrorCode.HOST_SESSION_EXPIRED) {
            setSessionExpired(true);
          }
          if (current.phase === 'enter-code') {
            setJoinError(message.data.message);
          } else {
            setClaimError(message.data.message);
          }
          return current;
        }
        default:
          return current;
      }
    });
  }, [conn, t, resetScoreRefs, setHostDisconnected, setJoinError, setClaimError, setSessionExpired]);

  useEffect(() => {
    conn.connect('contestant');
  }, []);

  useEffect(() => {
    conn.setMessageHandler(handleMessage);
    return () => conn.setMessageHandler(null);
  }, [handleMessage]);

  const sendScoreDebounced = useDebounce(() => {
    const state = appStateRef.current;
    if (state.phase !== 'playing') return;
    const sent = conn.sendEvent('submit-score', {
      playerIndex: state.claimedIndex,
      roundIndex: state.matchState.currentRound,
      predictions: latestPredRef.current !== undefined ? [latestPredRef.current] : [],
      actuals: latestActualRef.current !== undefined ? [latestActualRef.current] : [],
    });
    if (!sent) {
      setSendError(true);
      setTimeout(() => setSendError(false), 3000);
    }
  }, 300);

  const handleJoined = useCallback((code: string) => {
    joinCodeRef.current = code;
    conn.setJoinCode(code);
    conn.setSessionJoining();
    setJoinError(null);
  }, [conn, setJoinError]);

  const handleClaim = useCallback((playerIndex: number) => {
    conn.sendEvent('claim-slot', { playerIndex });
  }, [conn]);

  const handlePredictionChange = useCallback(
    (value: number) => {
      latestPredRef.current = value;
      sendScoreDebounced();
    },
    [latestPredRef, sendScoreDebounced],
  );

  const handleActualChange = useCallback(
    (value: number) => {
      latestActualRef.current = value;
      sendScoreDebounced();
    },
    [latestActualRef, sendScoreDebounced],
  );

  const handleDismissSummary = useCallback(() => {
    setAppState((current) => {
      if (current.phase === 'round-summary') {
        resetScoreRefs();
        const nextRound = current.roundIndex + 1;
        const maxRound = Math.max(0, current.matchState.rounds.length - 1);
        return {
          phase: 'playing',
          joinCode: current.joinCode,
          sessionToken: current.sessionToken,
          claimedIndex: current.claimedIndex,
          matchState: { ...current.matchState, currentRound: Math.min(nextRound, maxRound) },
        };
      }
      return current;
    });
  }, [resetScoreRefs]);

  const handleRejoin = useCallback(() => {
    setSessionExpired(false);
    conn.disconnect();
    setAppState({ phase: 'enter-code' });
  }, [conn, setSessionExpired]);

  const prevSessionRef = useRef(conn.connectionState.session);
  useEffect(() => {
    const prev = prevSessionRef.current;
    const curr = conn.connectionState.session;
    if (prev === 'REJOINING' && (curr === 'JOINED' || curr === 'ACTIVE')) {
      notifications.show({
        title: t('join.reconnectedTitle', 'Reconnected'),
        message: t('join.reconnectedMessage', 'Your connection has been restored.'),
        color: 'green',
        autoClose: 2000,
      });
    }
    prevSessionRef.current = curr;
  }, [conn.connectionState.session, t]);

  return {
    handleJoined,
    handleClaim,
    handlePredictionChange,
    handleActualChange,
    handleDismissSummary,
    handleRejoin,
    joinTimeoutRef,
  };
}
