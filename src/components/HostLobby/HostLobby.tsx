import { ActionIcon, Badge, Button, Card, CopyButton, Group, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { IconShare } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { PlayerSlot } from '@/types/game.ts';
import type { RelayToClientEnvelope } from '@/types/protocol.ts';
import { useGame } from '@/hooks/useGame.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';
import { accumulateScores, computeScoreChanges } from '@/utils/scoring.ts';
import { useConnection } from '@/contexts/ConnectionProvider.tsx';

const colorMap: Record<string, string> = {
  unclaimed: 'gray',
  claimed: 'green',
  disconnected: 'orange',
};

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

  const playersRef = useRef(players);
  const roundsRef = useRef(rounds);
  const scoresRef = useRef(scores);
  playersRef.current = players;
  roundsRef.current = rounds;
  scoresRef.current = scores;

  const currentRoundRef = useRef(currentRound);
  currentRoundRef.current = currentRound;

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

        const round = roundsRef.current[roundIndex];
        const mergedPredictions = [...round.predictions];
        mergedPredictions[playerIndex] = predictions[0];
        const mergedActuals = [...round.actuals];
        mergedActuals[playerIndex] = actuals[0];

        setPrediction(roundIndex, playerIndex, predictions[0]);
        setActual(roundIndex, playerIndex, actuals[0]);

        const changes = computeScoreChanges(mergedPredictions, mergedActuals);
        changes.forEach((change, i) => {
          setScoreChange(roundIndex, i, change);
        });

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
  }, [conn, updateSlotStatus, setPrediction, setActual, setScoreChange, rules]);

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
  }, [conn.connectionState.transport, conn]);

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
    [send, rules, isActive],
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
          {joinCode && (
            <>
              <Text fw={500}>{t('multiplayer.joinCode', 'Join Code')}</Text>
              <CopyButton value={joinCode}>
                {({ copied, copy }) => (
                  <Button fullWidth variant={copied ? 'filled' : 'outline'} color={copied ? 'green' : undefined} onClick={copy} size="lg">
                    {copied ? t('multiplayer.copied', 'Copied!') : joinCode}
                  </Button>
                )}
              </CopyButton>
              <Text size="xs" c="dimmed">
                {t('multiplayer.shareInstructions', 'Share this code with other players so they can join')}
              </Text>
            </>
          )}

          <Group>
            <Badge color={isConnected ? 'green' : 'red'} variant="dot">
              {isConnected ? t('multiplayer.connected', 'Connected') : t('multiplayer.disconnected', 'Disconnected')}
            </Badge>
            {isReconnecting && (
              <Badge color="yellow" variant="light">
                {t('multiplayer.reconnecting', 'Reconnecting...')}
              </Badge>
            )}
            {claimedCount > 0 && (
              <Badge color="green" variant="light">
                {claimedCount} {t('multiplayer.claimed', 'claimed')}
              </Badge>
            )}
            {disconnectedCount > 0 && (
              <Badge color="orange" variant="light">
                {disconnectedCount} {t('multiplayer.disconnectedSlots', 'disconnected')}
              </Badge>
            )}
          </Group>

          <Text size="sm" fw={500}>
            {t('multiplayer.playerSlots', 'Player Slots')}
          </Text>

          {playerSlots.map((slot) => (
            <Card key={slot.playerIndex} shadow="xs" padding="xs" radius="sm" withBorder>
              <FlexRow fullWidth>
                <Text size="sm">{slot.playerName}</Text>
                {(slot.slotStatus === 'claimed' || slot.slotStatus === 'disconnected') && (
                  <Button
                    variant="subtle"
                    color="red"
                    size="compact-xs"
                    onClick={() => setReleaseConfirm(slot)}
                  >
                    {t('multiplayer.releaseSlot', 'Release')}
                  </Button>
                )}
                <Badge color={colorMap[slot.slotStatus]} variant="light" size="sm">
                  {slot.slotStatus}
                </Badge>
              </FlexRow>
            </Card>
          ))}

          <Button color="red" variant="light" onClick={closeRoom}>
            {t('multiplayer.closeRoom', 'Close Room')}
          </Button>
        </Stack>
      </Modal>

      <Modal opened={!!releaseConfirm} onClose={() => setReleaseConfirm(null)} title={t('multiplayer.releaseConfirmTitle', 'Release Slot')}>
        <Text mb="md">
          {t('multiplayer.releaseConfirmBody', { name: releaseConfirm?.playerName ?? '' })}
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={() => setReleaseConfirm(null)}>
            {t('multiplayer.cancel', 'Cancel')}
          </Button>
          <Button color="red" onClick={handleReleaseSlot}>
            {t('multiplayer.releaseSlot', 'Release')}
          </Button>
        </Group>
      </Modal>

      <Modal opened={sessionExpired} onClose={() => setSessionExpired(false)} title={t('multiplayer.sessionExpiredTitle', 'Session Expired')}>
        <Text mb="md">{t('multiplayer.sessionExpiredMessage', 'Your host session has expired. Please create a new room.')}</Text>
        <Stack>
          <Button onClick={handleRejoin}>{t('multiplayer.createNewRoom', 'Create New Room')}</Button>
          <Button variant="default" onClick={() => setSessionExpired(false)}>{t('common.close', 'Close')}</Button>
        </Stack>
      </Modal>
    </>
  );
});
HostLobby.displayName = 'HostLobby';
