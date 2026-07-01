import { useCallback, useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';

const RECONNECT_BACKOFF = [1000, 2000, 4000, 5000];

export function useReconnect(
  onReconnect: () => void,
  wsRef: MutableRefObject<WebSocket | null>,
) {
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);

  const scheduleReconnect = useCallback(() => {
    const attempt = reconnectAttemptRef.current;
    const delayIdx = Math.min(attempt, RECONNECT_BACKOFF.length - 1);
    const delay = RECONNECT_BACKOFF[delayIdx];
    reconnectAttemptRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => {
      onReconnect();
    }, delay);
  }, [onReconnect]);

  const resetReconnectAttempt = useCallback(() => {
    reconnectAttemptRef.current = 0;
  }, []);

  const markIntentionalClose = useCallback(() => {
    intentionalCloseRef.current = true;
  }, []);

  const markUnintentionalClose = useCallback(() => {
    intentionalCloseRef.current = false;
  }, []);

  const isIntentionalClose = useCallback(() => intentionalCloseRef.current, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const readyState = wsRef.current?.readyState;
      if (readyState === WebSocket.CLOSED || readyState === WebSocket.CLOSING) {
        intentionalCloseRef.current = false;
        reconnectAttemptRef.current = 0;
        onReconnect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [onReconnect, wsRef]);

  return {
    scheduleReconnect,
    resetReconnectAttempt,
    markIntentionalClose,
    markUnintentionalClose,
    isIntentionalClose,
    reconnectTimerRef,
  };
}
