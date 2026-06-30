import { Button, Group, Stack, Text, TextInput } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChangeEvent, FunctionComponent, MutableRefObject } from 'react';
import { useConnection } from '@/contexts/ConnectionProvider.tsx';

interface JoinMatchProps {
  onJoined: (code: string) => void;
  joinTimeoutRef: MutableRefObject<ReturnType<typeof setTimeout> | null>;
  joinError: string | null;
}

export const JoinMatch: FunctionComponent<JoinMatchProps> = ({
  onJoined,
  joinTimeoutRef,
  joinError,
}) => {
  const { t } = useTranslation();
  const { sendEvent, disconnect, connectionState } = useConnection();
  const [firstPart, setFirstPart] = useState('');
  const [secondPart, setSecondPart] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const mountedRef = useRef(true);
  const secondRef = useRef<HTMLInputElement>(null);

  const isConnected = connectionState.transport === 'CONNECTED';
  const isConnecting = connectionState.transport === 'CONNECTING';

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (joinTimeoutRef.current) {
        clearTimeout(joinTimeoutRef.current);
        joinTimeoutRef.current = null;
      }
    };
  }, [joinTimeoutRef]);

  useEffect(() => {
    if (joinError) {
      setError(joinError);
      setIsJoining(false);
    }
  }, [joinError]);

  const handleFirstChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value.replace(/\D/g, '').slice(0, 3);
    setFirstPart(val);
    if (val.length === 3) {
      secondRef.current?.focus();
    }
  };

  const handleSecondChange = (event: ChangeEvent<HTMLInputElement>) => {
    const val = event.target.value.replace(/\D/g, '').slice(0, 3);
    setSecondPart(val);
  };

  const handleJoin = useCallback(() => {
    if (firstPart.length !== 3 || secondPart.length !== 3) return;

    const joinCode = `${firstPart}-${secondPart}`;

    setError(null);

    if (!isConnected) {
      setError(t('join.notConnected', 'Not connected to relay'));
      return;
    }

    const sent = sendEvent('join-room', { joinCode });
    if (!sent) {
      setError(t('join.notReady', 'Connection not ready. Please wait...'));
      return;
    }

    setIsJoining(true);
    onJoined(joinCode);

    joinTimeoutRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setIsJoining(false);
        setError(t('join.timeout', 'Connection timed out'));
      }
      disconnect();
      joinTimeoutRef.current = null;
    }, 10000);
  }, [firstPart, secondPart, isConnected, sendEvent, disconnect, onJoined, joinTimeoutRef, t]);

  const isFormValid = firstPart.length === 3 && secondPart.length === 3;

  return (
    <Stack>
      <Stack gap={4}>
        <Text size="sm" fw={500}>
          {t('join.enterCode', 'Enter Join Code')}
        </Text>
        <Group gap={0} align="center">
          <TextInput
            placeholder="000"
            maxLength={3}
            inputMode="numeric"
            value={firstPart}
            onChange={handleFirstChange}
            disabled={isJoining}
            error={undefined}
            styles={{ input: { textAlign: 'center', width: 80 } }}
          />
          <Text fz="xl" mx={4}>
            -
          </Text>
          <TextInput
            ref={secondRef}
            placeholder="000"
            maxLength={3}
            inputMode="numeric"
            value={secondPart}
            onChange={handleSecondChange}
            disabled={isJoining}
            error={undefined}
            styles={{ input: { textAlign: 'center', width: 80 } }}
          />
        </Group>
      </Stack>
      {error && (
        <Text c="red" size="sm">
          {error}
        </Text>
      )}
      <Button onClick={handleJoin} loading={isJoining || isConnecting} disabled={(!isFormValid || !isConnected) && !isConnecting}>
        {isConnecting ? t('join.connecting', 'Connecting...') : t('join.connect', 'Connect')}
      </Button>
    </Stack>
  );
};
