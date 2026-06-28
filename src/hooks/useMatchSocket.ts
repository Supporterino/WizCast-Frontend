import { useCallback, useEffect, useRef, useState } from 'react';
import type { ClientToRelayPayload, RelayToClientEnvelope } from '@/types/protocol.ts';

export interface UseMatchSocketOptions {
  url: string;
  onMessage?: (message: RelayToClientEnvelope) => void;
  autoReconnect?: boolean;
}

export function useMatchSocket({ url, onMessage, autoReconnect = true }: UseMatchSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    const ws = new WebSocket(url);
    wsRef.current = ws;
    setIsConnecting(true);

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setIsReconnecting(false);
      reconnectAttemptRef.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string) as RelayToClientEnvelope;
        if (message.event === 'room-joined' && 'sessionToken' in message.data) {
          sessionTokenRef.current = message.data.sessionToken;
        }
        onMessageRef.current?.(message);
      } catch {
        console.error('Failed to parse WebSocket message:', event.data);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnecting(false);
      if (autoReconnect) {
        setIsReconnecting(true);
        scheduleReconnect();
      }
    };

    ws.onerror = () => {
      setIsConnecting(false);
      ws.close();
    };
  }, [url, autoReconnect]);

  const scheduleReconnect = useCallback(() => {
    const attempt = reconnectAttemptRef.current;
    const delay = Math.min(1000 * Math.pow(2, attempt), 5000);
    reconnectAttemptRef.current += 1;

    reconnectTimerRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  const disconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    reconnectAttemptRef.current = 0;
    wsRef.current?.close();
    wsRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setIsReconnecting(false);
  }, []);

  const sendEvent = useCallback((event: string, data: ClientToRelayPayload): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
      return true;
    }
    return false;
  }, []);

  const getSessionToken = useCallback(() => sessionTokenRef.current, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      wsRef.current?.close();
    };
  }, [connect]);

  return {
    sendEvent,
    isConnected,
    isConnecting,
    isReconnecting,
    getSessionToken,
    disconnect,
    connect,
  };
}
