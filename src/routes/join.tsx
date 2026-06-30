import { createFileRoute } from '@tanstack/react-router';
import { Badge, Button, Container, Grid, GridCol, Modal, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { RelayToClientEnvelope } from '@/types/protocol.ts';
import type { RoundData, Rule, SlotStatus } from '@/types/game.ts';
import { ErrorCode } from '@/types/protocol.ts';
import { JoinMatch } from '@/components/JoinMatch/JoinMatch.tsx';
import { ClaimSlot } from '@/components/ClaimSlot/ClaimSlot.tsx';
import { PlayerCard } from '@/components/PlayerCard/PlayerCard.tsx';
import { RoundSummary } from '@/components/RoundSummary/RoundSummary.tsx';
import { ConnectionProvider, useConnection } from '@/contexts/ConnectionProvider.tsx';

type AppState =
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

function JoinPage() {
  const { t } = useTranslation();
  const [appState, setAppState] = useState<AppState>({ phase: 'enter-code' });
  const [claimError, setClaimError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const [sendError, setSendError] = useState(false);
  const [hostDisconnected, setHostDisconnected] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [localPrediction, setLocalPrediction] = useState<number | undefined>(undefined);
  const [localActual, setLocalActual] = useState<number | undefined>(undefined);
  const joinCodeRef = useRef<string | null>(null);
  const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const appStateRef = useRef(appState);
  appStateRef.current = appState;

  const contestantDebounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const latestPredRef = useRef<number | undefined>(undefined);
  const latestActualRef = useRef<number | undefined>(undefined);
  const summaryDismissRef = useRef<ReturnType<typeof setTimeout>>(null);

  const hostDisconnectedRef = useRef(false);
  hostDisconnectedRef.current = hostDisconnected;

  const conn = useConnection();

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
            latestPredRef.current = undefined;
            latestActualRef.current = undefined;
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
            setLocalPrediction(undefined);
            setLocalActual(undefined);
            return { ...current, matchState: message.data.matchState as typeof current.matchState };
          }
          return current;
        }
        case 'round-completed': {
          if (current.phase === 'playing') {
            setLocalPrediction(undefined);
            setLocalActual(undefined);
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
  }, [conn]);

  useEffect(() => {
    conn.connect('contestant');
  }, []);

  useEffect(() => {
    conn.setMessageHandler(handleMessage);
    return () => conn.setMessageHandler(null);
  }, [handleMessage]);

  const handleJoined = (code: string) => {
    joinCodeRef.current = code;
    conn.setJoinCode(code);
    conn.setSessionJoining();
    setJoinError(null);
  };

  const handleClaim = (playerIndex: number) => {
    conn.sendEvent('claim-slot', { playerIndex });
  };

  const sendScoreDebounced = useCallback(() => {
    if (contestantDebounceRef.current) clearTimeout(contestantDebounceRef.current);
    contestantDebounceRef.current = setTimeout(() => {
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
  }, [conn]);

  const handlePredictionChange = useCallback(
    (value: number) => {
      setLocalPrediction(value);
      latestPredRef.current = value;
      sendScoreDebounced();
    },
    [sendScoreDebounced],
  );

  const handleActualChange = useCallback(
    (value: number) => {
      setLocalActual(value);
      latestActualRef.current = value;
      sendScoreDebounced();
    },
    [sendScoreDebounced],
  );

  const handleDismissSummary = useCallback(() => {
    setAppState((current) => {
      if (current.phase === 'round-summary') {
        latestPredRef.current = undefined;
        latestActualRef.current = undefined;
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
  }, []);

  const handleRejoin = useCallback(() => {
    setSessionExpired(false);
    conn.disconnect();
    setAppState({ phase: 'enter-code' });
  }, [conn]);

  useEffect(() => {
    return () => {
      if (contestantDebounceRef.current) clearTimeout(contestantDebounceRef.current);
      if (summaryDismissRef.current) clearTimeout(summaryDismissRef.current);
    };
  }, []);

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

  const isConnected = conn.connectionState.transport === 'CONNECTED';
  const sessionActive = conn.connectionState.session === 'ACTIVE';
  const isRejoining = conn.connectionState.session === 'REJOINING';

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">
        {t('join.title', 'Join Match')}
      </Title>

      <Text size="sm" c={sendError ? 'red' : isConnected ? 'green' : 'red'} mb="md">
        {sendError ? t('join.sendError', 'Error sending') : isConnected ? t('join.connected', 'Connected') : t('join.disconnected', 'Disconnected')}
      </Text>

      {isRejoining && (
        <Badge variant="light" color="yellow" mb="md" style={{ animation: 'pulse 1.5s infinite' }}>
          {t('join.reconnecting', 'Reconnecting...')}
        </Badge>
      )}

      {hostDisconnected && (
        <Badge variant="filled" color="orange" w="100%" mb="md">
          {t('join.hostDisconnected', 'Waiting for host...')}
        </Badge>
      )}

      {appState.phase === 'enter-code' && (
        <JoinMatch
          onJoined={handleJoined}
          joinTimeoutRef={joinTimeoutRef}
          joinError={joinError}
        />
      )}

      {appState.phase === 'claim-slot' && (
        <ClaimSlot
          players={appState.players}
          slotStatuses={appState.slotStatuses}
          onClaim={handleClaim}
          claimedIndex={null}
          error={claimError}
        />
      )}

      {appState.phase === 'playing' && (() => {
        const roundCount = appState.matchState.rounds.length;
        const currentDisplay = appState.matchState.currentRound + 1;
        return (
        <Stack>
          {roundCount > 0 && (
            <Badge variant="light" size="lg">
              {t('join.roundBadge', { current: currentDisplay, total: roundCount })}
            </Badge>
          )}
          <Grid>
            {appState.matchState.players.map((name, idx) => {
              const isOwnCard = idx === appState.claimedIndex;
              const round = appState.matchState.rounds[appState.matchState.currentRound] as RoundData | undefined;
              const frozen = !sessionActive || hostDisconnected;
              return (
                <GridCol span={6} key={idx}>
                  <PlayerCard
                    name={name}
                    idx={idx}
                    prediction={isOwnCard ? (localPrediction ?? round?.predictions[idx]) : round?.predictions[idx]}
                    actual={isOwnCard ? (localActual ?? round?.actuals[idx]) : round?.actuals[idx]}
                    score={appState.matchState.scores[idx]}
                    scoreChange={round?.scoreChanges[idx]}
                    currentRound={appState.matchState.currentRound}
                    playingRound={appState.matchState.currentRound}
                    playerCount={appState.matchState.players.length}
                    onPredictionChange={isOwnCard && !frozen ? handlePredictionChange : undefined}
                    onActualChange={isOwnCard && !frozen ? handleActualChange : undefined}
                  />
                </GridCol>
              );
            })}
          </Grid>
        </Stack>
          );
        })()}

      {appState.phase === 'round-summary' && (
        <RoundSummary
          players={appState.matchState.players}
          scoreChanges={appState.scoreChanges}
          roundIndex={appState.roundIndex}
          onDismiss={handleDismissSummary}
        />
      )}

      <Modal opened={sessionExpired} onClose={() => setSessionExpired(false)} title={t('join.sessionExpiredTitle', 'Session Expired')}>
        <Text mb="md">{t('join.sessionExpiredMessage', 'Your session has expired. Would you like to rejoin the game?')}</Text>
        <Stack>
          <Button onClick={handleRejoin}>{t('join.rejoinGame', 'Rejoin Game')}</Button>
          <Button variant="default" onClick={() => setSessionExpired(false)}>{t('common.close', 'Close')}</Button>
        </Stack>
      </Modal>
    </Container>
  );
}

function JoinPageWrapper() {
  return (
    <ConnectionProvider>
      <JoinPage />
    </ConnectionProvider>
  );
}

export const Route = createFileRoute('/join')({
  component: JoinPageWrapper,
});
