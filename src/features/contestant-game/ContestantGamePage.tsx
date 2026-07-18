import { Badge, Group, Text } from '@mantine/core';
import type { FunctionComponent } from 'react';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FlexCol } from '@/shared/components/Layout/FlexCol.tsx';
import { useConnection } from '@/shared/hooks/useConnection.ts';
import { ContestantPlayingView } from './components/ContestantPlayingView.tsx';
import { JoinCodeEntry } from './components/JoinCodeEntry.tsx';
import { RoundSummaryOverlay } from './components/RoundSummaryOverlay.tsx';
import { SessionExpiredOverlay } from './components/SessionExpiredOverlay.tsx';
import { SlotClaimPanel } from './components/SlotClaimPanel.tsx';
import { useContestantEvents } from './hooks/useContestantEvents.ts';
import { useContestantPhase } from './hooks/useContestantPhase.ts';

export const ContestantGamePage: FunctionComponent = () => {
  const { t } = useTranslation();
  const conn = useConnection();

  useEffect(() => {
    return () => {
      conn.disconnect();
    };
  }, [conn.disconnect]);

  const {
    appState,
    setAppState,
    appStateRef,
    claimError,
    setClaimError,
    joinError,
    setJoinError,
    sendError,
    setSendError,
    hostDisconnected,
    setHostDisconnected,
    sessionExpired,
    setSessionExpired,
    localPrediction,
    localActual,
    latestPredRef,
    latestActualRef,
    resetScoreRefs,
  } = useContestantPhase();

  const { handleJoined, handleClaim, handlePredictionChange, handleActualChange, handleDismissSummary, handleRejoin, joinTimeoutRef } =
    useContestantEvents({
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
    });

  const isConnected = conn.connectionState.transport === 'CONNECTED';
  const sessionActive = conn.connectionState.session === 'ACTIVE';
  const isRejoining = conn.connectionState.session === 'REJOINING';

  return (
    <FlexCol fullWidth h="100%" justify="flex-start" mb="md">
      <Group justify="flex-end">
        <Text size="sm" c={sendError ? 'red' : isConnected ? 'green' : 'red'} mb="md">
          {sendError
            ? t('join.sendError', 'Error sending')
            : isConnected
              ? t('join.connected', 'Connected')
              : t('join.disconnected', 'Disconnected')}
        </Text>
      </Group>

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

      {appState.phase === 'enter-code' && <JoinCodeEntry onJoined={handleJoined} joinTimeoutRef={joinTimeoutRef} joinError={joinError} />}

      {appState.phase === 'claim-slot' && (
        <SlotClaimPanel
          players={appState.players}
          slotStatuses={appState.slotStatuses}
          onClaim={handleClaim}
          claimedIndex={null}
          error={claimError}
        />
      )}

      {appState.phase === 'playing' && (
        <ContestantPlayingView
          players={appState.matchState.players}
          rounds={appState.matchState.rounds}
          scores={appState.matchState.scores}
          currentRound={appState.matchState.currentRound}
          claimedIndex={appState.claimedIndex}
          localPrediction={localPrediction}
          localActual={localActual}
          onPredictionChange={handlePredictionChange}
          onActualChange={handleActualChange}
          isFrozen={!sessionActive || hostDisconnected}
        />
      )}

      {appState.phase === 'round-summary' && (
        <RoundSummaryOverlay
          players={appState.matchState.players}
          scoreChanges={appState.scoreChanges}
          roundIndex={appState.roundIndex}
          onDismiss={handleDismissSummary}
        />
      )}

      <SessionExpiredOverlay opened={sessionExpired} onClose={() => setSessionExpired(false)} onRejoin={handleRejoin} />
    </FlexCol>
  );
};
