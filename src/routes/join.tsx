import { createFileRoute } from '@tanstack/react-router';
import { Container, Stack, Text, Title } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useRef, useState } from 'react';
import type { RelayToClientEnvelope } from '@/types/protocol.ts';
import type { RoundData, Rule, SlotStatus } from '@/types/game.ts';
import { JoinMatch } from '@/components/JoinMatch/JoinMatch.tsx';
import { ClaimSlot } from '@/components/ClaimSlot/ClaimSlot.tsx';
import { ContestantGameView } from '@/components/ContestantGameView/ContestantGameView.tsx';
import { ContestantScoreInput } from '@/components/ContestantScoreInput/ContestantScoreInput.tsx';
import { useMatchSocket } from '@/hooks/useMatchSocket.ts';

const DEFAULT_RELAY_URL = 'ws://localhost:3000';

type AppState =
  | { phase: 'enter-code' }
  | { phase: 'claim-slot'; joinCode: string; players: Array<string>; slotStatuses: Array<SlotStatus>; sessionToken: string }
  | {
      phase: 'playing';
      joinCode: string;
      sessionToken: string;
      claimedIndex: number;
      matchState: { players: Array<string>; rounds: Array<RoundData>; scores: Array<number>; rules: Array<Rule>; currentRound: number };
    };

function JoinPage() {
  const { t } = useTranslation();
  const [appState, setAppState] = useState<AppState>({ phase: 'enter-code' });
  const [claimError, setClaimError] = useState<string | null>(null);
  const [joinError, setJoinError] = useState<string | null>(null);
  const joinCodeRef = useRef<string | null>(null);
  const joinTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMessage = (message: RelayToClientEnvelope) => {
    setAppState((current) => {
      switch (message.event) {
        case 'room-joined': {
          if (joinTimeoutRef.current) {
            clearTimeout(joinTimeoutRef.current);
            joinTimeoutRef.current = null;
          }
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
          if (current.phase === 'playing') {
            return { ...current, matchState: message.data.matchState as typeof current.matchState };
          }
          return current;
        }
        case 'room-closed':
          return { phase: 'enter-code' };
        case 'error': {
          if (joinTimeoutRef.current) {
            clearTimeout(joinTimeoutRef.current);
            joinTimeoutRef.current = null;
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
  };

  const { sendEvent, isConnected, isConnecting, disconnect } = useMatchSocket({
    url: DEFAULT_RELAY_URL,
    onMessage: handleMessage,
  });

  const handleJoined = (code: string) => {
    joinCodeRef.current = code;
    setJoinError(null);
  };

  const handleClaim = (playerIndex: number) => {
    sendEvent('claim-slot', { playerIndex });
  };

  const handleScoreSubmit = (predictions: Array<number>, actuals: Array<number>) => {
    if (appState.phase !== 'playing') return;
    sendEvent('submit-score', {
      playerIndex: appState.claimedIndex,
      roundIndex: appState.matchState.currentRound,
      predictions,
      actuals,
    });
  };

  return (
    <Container size="sm" py="xl">
      <Title order={2} mb="lg">
        {t('join.title', 'Join Match')}
      </Title>

      <Text size="sm" c={isConnected ? 'green' : 'red'} mb="md">
        {isConnected ? t('join.connected', 'Connected') : t('join.disconnected', 'Disconnected')}
      </Text>

      {appState.phase === 'enter-code' && (
        <JoinMatch
          sendEvent={sendEvent}
          isConnected={isConnected}
          isConnecting={isConnecting}
          disconnect={disconnect}
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

      {appState.phase === 'playing' && (
        <Stack>
          <ContestantGameView
            players={appState.matchState.players}
            rounds={appState.matchState.rounds}
            scores={appState.matchState.scores}
            currentRound={appState.matchState.currentRound}
          />
          <ContestantScoreInput
            playerIndex={appState.claimedIndex}
            roundIndex={appState.matchState.currentRound}
            maxValue={appState.matchState.currentRound + 1}
            rules={appState.matchState.rules}
            onSubmit={handleScoreSubmit}
            disabled={!isConnected}
          />
        </Stack>
      )}
    </Container>
  );
}

export const Route = createFileRoute('/join')({
  component: JoinPage,
});
