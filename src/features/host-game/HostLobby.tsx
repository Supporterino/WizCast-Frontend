import { ActionIcon, Button, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { IconShare } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { JoinCodeShare } from './components/JoinCodeShare.tsx';
import { SlotManager } from './components/SlotManager.tsx';
import { IncomingScoreAlert } from './components/IncomingScoreAlert.tsx';
import type { PlayerSlot } from '@/types/game.ts';
import type { RelayToClientEnvelope } from '@/types/protocol.ts';
import { useGame } from '@/shared/hooks/useGame.tsx';
import { accumulateScores, computeSingleScoreChange } from '@/utils/scoring.ts';
import { useConnection } from '@/shared/hooks/useConnection.ts';
import { useStableRef } from '@/shared/hooks/useStableRef.ts';
import { SessionExpiredModal } from '@/shared/components/SessionExpiredModal/SessionExpiredModal.tsx';

export interface HostLobbyHandle {
  broadcastState: () => void;
  sendEvent: (event: string, data: Record<string, unknown>) => void;
  isRoomActive: () => boolean;
}

export const HostLobby = forwardRef<HostLobbyHandle>((_props, ref) => {
  const { t } = useTranslation();
  const {
    players,
    rounds,
    scores,
    rules,
    currentRound,
    playerSlots,
    updateSlotStatus,
    setPrediction,
    setActual,
    setScoreChange,
  } = useGame();
  const conn = useConnection();
  const [opened, setOpened] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [releaseConfirm, setReleaseConfirm] = useState<PlayerSlot | null>(null);

  const playersRef = useStableRef(players);
  const roundsRef = useStableRef(rounds);
  const scoresRef = useStableRef(scores);
  const currentRoundRef = useStableRef(currentRound);

  const shouldCreateRoomRef = useRef(false);

  const isConnected = conn.connectionState.transport === 'CONNECTED';
  const isConnecting = conn.connectionState.transport === 'CONNECTING';
  const isCreating = conn.connectionState.session === 'CREATING' || isConnecting;
  const isActive = conn.connectionState.session === 'ACTIVE';
  const isReconnecting = isConnecting && !!conn.hostToken;

  const handleMessage = useCallback((msg: RelayToClientEnvelope) => {
    switch (msg.event) {
      case 'room-created':
        setJoinCode(msg.data.joinCode);
        setError(null);
        conn.setSessionActive();
        setOpened(true);
        conn.sendEvent('state-sync', {
          matchState: {
            players: playersRef.current,
            rounds: roundsRef.current,
            scores: scoresRef.current,
            rules,
            currentRound: currentRoundRef.current,
          },
        });
        break;
      case 'contestant-joined':
        break;
      case 'contestant-left':
        updateSlotStatus(msg.data.playerIndex, 'unclaimed');
        break;
      case 'score-submitted': {
        const { playerIndex, roundIndex, predictions, actuals } = msg.data;
        if (roundIndex < 0 || roundIndex >= roundsRef.current.length) {
          conn.sendEvent('error', { code: 'INVALID_SLOT', message: 'Invalid round index' });
          break;
        }
        if (playerIndex < 0 || playerIndex >= playersRef.current.length) {
          conn.sendEvent('error', { code: 'INVALID_SLOT', message: 'Invalid player index' });
          break;
        }

        const hasPredictions = Array.isArray(predictions) && predictions.length > 0;
        const hasActuals = Array.isArray(actuals) && actuals.length > 0;

        if (!hasPredictions && !hasActuals) break;

        const round = roundsRef.current[roundIndex];
        const mergedPredictions = [...round.predictions];
        const mergedActuals = [...round.actuals];

        if (hasPredictions) {
          mergedPredictions[playerIndex] = predictions[0];
          setPrediction(roundIndex, playerIndex, predictions[0]);
        }
        if (hasActuals) {
          mergedActuals[playerIndex] = actuals[0];
          setActual(roundIndex, playerIndex, actuals[0]);
        }

        const changes = [...round.scoreChanges];
        const playerPrediction = mergedPredictions[playerIndex];
        const playerActual = mergedActuals[playerIndex];
        if (playerPrediction !== undefined && playerActual !== undefined) {
          const singleChange = computeSingleScoreChange(playerPrediction, playerActual);
          changes[playerIndex] = singleChange;
          setScoreChange(roundIndex, playerIndex, singleChange);
        }

        const updatedRounds = roundsRef.current.map((r) => {
          if (r.id === roundIndex) {
            return { ...r, predictions: mergedPredictions, actuals: mergedActuals, scoreChanges: changes };
          }
          return r;
        });
        const updatedScores = accumulateScores(updatedRounds, playersRef.current.length);
        conn.sendEvent('state-sync', {
          matchState: {
            players: playersRef.current,
            rounds: updatedRounds,
            scores: updatedScores,
            rules,
            currentRound: currentRoundRef.current,
          },
        });
        break;
      }
      case 'slot-status-changed':
        updateSlotStatus(msg.data.playerIndex, msg.data.status);
        break;
      case 'error':
        if (msg.data.code === 'HOST_SESSION_EXPIRED') {
          setSessionExpired(true);
          setJoinCode(null);
          conn.setSessionDisconnected();
        } else {
          setError(msg.data.message);
        }
        break;
    }
  }, [conn, updateSlotStatus, setPrediction, setActual, setScoreChange, rules, playersRef, roundsRef, scoresRef, currentRoundRef]);

  useEffect(() => {
    conn.setMessageHandler(handleMessage);
    return () => conn.setMessageHandler(null);
  }, [handleMessage]);

  useEffect(() => {
    if (conn.connectionState.transport === 'CONNECTED' && shouldCreateRoomRef.current) {
      shouldCreateRoomRef.current = false;
      conn.sendEvent('create-room', { matchState: { players: playersRef.current } });
      conn.setSessionCreating();
    }
  }, [conn.connectionState.transport, conn, playersRef]);

  const send = useCallback((event: string, data: Record<string, unknown>) => {
    conn.sendEvent(event, data);
  }, [conn]);

  useImperativeHandle(
    ref,
    () => ({
      broadcastState: () => {
        conn.sendEvent('state-sync', {
          matchState: {
            players: playersRef.current,
            rounds: roundsRef.current,
            scores: scoresRef.current,
            rules,
            currentRound: currentRoundRef.current,
          },
        });
      },
      sendEvent: (event: string, data: Record<string, unknown>) => {
        send(event, data);
      },
      isRoomActive: () => isActive,
    }),
    [send, rules, isActive, conn, playersRef, roundsRef, scoresRef, currentRoundRef],
  );

  const closeRoom = useCallback(() => {
    conn.sendEvent('close-room', {});
    conn.disconnect();
    setJoinCode(null);
    setOpened(false);
  }, [conn]);

  const handleReleaseSlot = () => {
    if (!releaseConfirm) return;
    conn.sendEvent('release-slot', { playerIndex: releaseConfirm.playerIndex });
    setReleaseConfirm(null);
  };

  const handleClick = () => {
    if (isCreating) return;
    if (joinCode) {
      setOpened(true);
    } else {
      setError(null);
      shouldCreateRoomRef.current = true;
      conn.connect('host');
    }
  };

  const handleRejoin = useCallback(() => {
    setSessionExpired(false);
    conn.disconnect();
    setJoinCode(null);
    shouldCreateRoomRef.current = true;
    conn.connect('host');
  }, [conn]);

  const claimedCount = playerSlots.filter((s) => s.slotStatus === 'claimed').length;
  const disconnectedCount = playerSlots.filter((s) => s.slotStatus === 'disconnected').length;

  return (
    <>
      <Tooltip label={t('multiplayer.shareJoinCode', 'Share join code')}>
        <ActionIcon variant="light" onClick={handleClick} loading={isCreating}>
          <IconShare stroke={1.5} />
        </ActionIcon>
      </Tooltip>

      <Modal opened={opened} onClose={() => setOpened(false)} title={t('multiplayer.hostLobby', 'Multiplayer')} size="sm">
        <Stack>
          {error && (
            <Text c="red" size="sm">
              {error}
            </Text>
          )}
          <JoinCodeShare joinCode={joinCode} />

          <IncomingScoreAlert
            isConnected={isConnected}
            isReconnecting={isReconnecting}
            claimedCount={claimedCount}
            disconnectedCount={disconnectedCount}
          />

          <SlotManager
            playerSlots={playerSlots}
            onReleaseSlot={setReleaseConfirm}
            releaseConfirm={releaseConfirm}
            setReleaseConfirm={setReleaseConfirm}
            onConfirmRelease={handleReleaseSlot}
          />

          <Button color="red" variant="light" onClick={closeRoom}>
            {t('multiplayer.closeRoom', 'Close Room')}
          </Button>
        </Stack>
      </Modal>

      <SessionExpiredModal
        opened={sessionExpired}
        onClose={() => setSessionExpired(false)}
        title={t('multiplayer.sessionExpiredTitle', 'Session Expired')}
        message={t('multiplayer.sessionExpiredMessage', 'Your host session has expired. Please create a new room.')}
        rejoinLabel={t('multiplayer.createNewRoom', 'Create New Room')}
        closeLabel={t('common.close', 'Close')}
        onRejoin={handleRejoin}
      />
    </>
  );
});
HostLobby.displayName = 'HostLobby';
