import { ActionIcon, Badge, Button, Card, CopyButton, Group, Modal, Stack, Text, Tooltip } from '@mantine/core';
import { IconShare } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useCallback, useRef, useState } from 'react';
import type { FunctionComponent } from 'react';
import type { RelayToClientEnvelope } from '@/types/protocol.ts';
import { useGame } from '@/hooks/useGame.tsx';
import { FlexRow } from '@/components/Layout/FlexRow.tsx';

const colorMap: Record<string, string> = {
  unclaimed: 'gray',
  claimed: 'green',
  disconnected: 'orange',
};

export const HostLobby: FunctionComponent = () => {
  const { t } = useTranslation();
  const { players, playerSlots, updateSlotStatus } = useGame();
  const [opened, setOpened] = useState(false);
  const [joinCode, setJoinCode] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const isCreatingRef = useRef(false);

  const relayUrl = localStorage.getItem('relayUrl') ?? 'ws://localhost:3000';

  const send = useCallback((event: string, data: Record<string, unknown>) => {
    wsRef.current?.send(JSON.stringify({ event, data }));
  }, []);

  const createRoom = useCallback(() => {
    if (isCreating || wsRef.current) return;
    setIsCreating(true);
    isCreatingRef.current = true;
    setError(null);

    const timeout = setTimeout(() => {
      setIsCreating(false);
      isCreatingRef.current = false;
      setError(t('multiplayer.roomCreationTimeout', 'Room creation timed out. Is the relay server running?'));
      wsRef.current?.close();
      wsRef.current = null;
    }, 10000);

    const ws = new WebSocket(relayUrl);

    ws.onopen = () => {
      setIsConnected(true);
      ws.send(JSON.stringify({ event: 'create-room', data: { matchState: { players } } }));
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as RelayToClientEnvelope;
        switch (msg.event) {
          case 'room-created':
            clearTimeout(timeout);
            setJoinCode(msg.data.joinCode);
            setIsCreating(false);
            isCreatingRef.current = false;
            setError(null);
            setOpened(true);
            break;
          case 'contestant-joined':
            break;
          case 'contestant-left':
            updateSlotStatus(msg.data.playerIndex, 'unclaimed');
            break;
          case 'slot-status-changed':
            updateSlotStatus(msg.data.playerIndex, msg.data.status);
            break;
          case 'error':
            clearTimeout(timeout);
            setIsCreating(false);
            isCreatingRef.current = false;
            setError(msg.data.message);
            wsRef.current?.close();
            wsRef.current = null;
            break;
        }
      } catch {
        /* ignore malformed messages */
      }
    };

    ws.onerror = () => {
      clearTimeout(timeout);
      setIsCreating(false);
      isCreatingRef.current = false;
      setError(t('multiplayer.relayUnreachable', 'Could not reach relay server'));
      wsRef.current = null;
    };

    ws.onclose = () => {
      clearTimeout(timeout);
      setIsConnected(false);
      if (isCreatingRef.current) {
        setError(t('multiplayer.relayUnreachable', 'Could not reach relay server'));
      }
      setIsCreating(false);
      isCreatingRef.current = false;
      setJoinCode(null);
      wsRef.current = null;
    };

    wsRef.current = ws;
  }, [isCreating, relayUrl, players, updateSlotStatus, t]);

  const closeRoom = useCallback(() => {
    send('close-room', {});
    wsRef.current?.close();
    wsRef.current = null;
    setJoinCode(null);
    setIsConnected(false);
    setOpened(false);
  }, [send]);

  const handleClick = () => {
    if (isCreating) return;
    if (joinCode) {
      setOpened(true);
    } else {
      createRoom();
    }
  };

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
    </>
  );
};
