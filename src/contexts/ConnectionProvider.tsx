import type { FunctionComponent, ReactNode } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_RELAY_URL } from '@/shared/constants.ts';
import type { RelayToClientEnvelope, SlotStatus } from '@/types/protocol.ts';

export type TransportState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

type ContestantSessionState = 'DISCONNECTED' | 'JOINING' | 'JOINED' | 'ACTIVE' | 'REJOINING';
type HostSessionState = 'DISCONNECTED' | 'CREATING' | 'ACTIVE';
export type SessionState = ContestantSessionState | HostSessionState;

type Role = 'host' | 'contestant' | 'none';

export interface ConnectionStateValue {
  transport: TransportState;
  session: SessionState;
  role: Role;
}

export interface ConnectionContextValue {
  connectionState: ConnectionStateValue;
  sendEvent: (event: string, data: Record<string, unknown>) => boolean;
  relayUrl: string;
  setRelayUrl: (url: string) => void;
  sessionToken: string | null;
  hostToken: string | null;
  joinCode: string | null;
  slotStatuses: Array<SlotStatus>;
  disconnect: () => void;
  connect: (role: Role) => void;
  setMessageHandler: (handler: ((msg: RelayToClientEnvelope) => void) | null) => void;
  setSessionActive: () => void;
  setSessionJoining: () => void;
  setSessionJoined: () => void;
  setSessionCreating: () => void;
  setSessionDisconnected: () => void;
  setSessionRejoining: () => void;
  setJoinCode: (code: string | null) => void;
  setSlotStatuses: (statuses: Array<SlotStatus>) => void;
  setSessionToken: (token: string | null) => void;
  setHostToken: (token: string | null) => void;
}

export const ConnectionContext = createContext<ConnectionContextValue | undefined>(undefined);

const RECONNECT_BACKOFF = [1000, 2000, 4000, 5000];

export const ConnectionProvider: FunctionComponent<{ children?: ReactNode }> = ({ children }) => {
  const relayUrlRef = useRef(localStorage.getItem('relayUrl') ?? DEFAULT_RELAY_URL);
  const [relayUrlState, setRelayUrlState] = useState(relayUrlRef.current);

  const [transport, setTransport] = useState<TransportState>('DISCONNECTED');
  const [session, setSession] = useState<SessionState>('DISCONNECTED');
  const [role, setRole] = useState<Role>('none');

  const [sessionTokenState, setSessionTokenState] = useState<string | null>(null);
  const [hostTokenState, setHostTokenState] = useState<string | null>(null);
  const [joinCodeState, setJoinCodeState] = useState<string | null>(null);
  const [slotStatusesState, setSlotStatusesState] = useState<Array<SlotStatus>>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pongTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalCloseRef = useRef(false);
  const roleRef = useRef<Role>('none');
  const joinCodeRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);
  const hostTokenRef = useRef<string | null>(null);
  const messageHandlerRef = useRef<((msg: RelayToClientEnvelope) => void) | null>(null);
  const transportRef = useRef<TransportState>('DISCONNECTED');

  roleRef.current = role;
  joinCodeRef.current = joinCodeState;
  sessionTokenRef.current = sessionTokenState;
  hostTokenRef.current = hostTokenState;
  transportRef.current = transport;

  const setMessageHandler = useCallback((handler: ((msg: RelayToClientEnvelope) => void) | null) => {
    messageHandlerRef.current = handler;
  }, []);

  const setSessionActive = useCallback(() => setSession('ACTIVE'), []);
  const setSessionJoining = useCallback(() => setSession('JOINING'), []);
  const setSessionJoined = useCallback(() => setSession('JOINED'), []);
  const setSessionCreating = useCallback(() => setSession('CREATING'), []);
  const setSessionDisconnected = useCallback(() => setSession('DISCONNECTED'), []);
  const setSessionRejoining = useCallback(() => setSession('REJOINING' as ContestantSessionState), []);

  const setJoinCode = useCallback((code: string | null) => {
    setJoinCodeState(code);
    joinCodeRef.current = code;
  }, []);

  const setSlotStatuses = useCallback((statuses: Array<SlotStatus>) => setSlotStatusesState(statuses), []);

  const setSessionToken = useCallback((token: string | null) => {
    setSessionTokenState(token);
    sessionTokenRef.current = token;
  }, []);

  const setHostToken = useCallback((token: string | null) => {
    setHostTokenState(token);
    hostTokenRef.current = token;
  }, []);

  const scheduleReconnect = useCallback(() => {
    const attempt = reconnectAttemptRef.current;
    const delayIdx = Math.min(attempt, RECONNECT_BACKOFF.length - 1);
    const delay = RECONNECT_BACKOFF[delayIdx];
    reconnectAttemptRef.current += 1;
    reconnectTimerRef.current = setTimeout(() => {
      doConnect();
    }, delay);
  }, []);

  const doConnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    setTransport('CONNECTING');
    const ws = new WebSocket(relayUrlRef.current);
    wsRef.current = ws;

    ws.onopen = () => {
      setTransport('CONNECTED');
      reconnectAttemptRef.current = 0;

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
        pongTimeoutRef.current = null;
      }
      pingIntervalRef.current = setInterval(() => {
        wsRef.current?.send(JSON.stringify({ event: 'ping', data: {} }));
        pongTimeoutRef.current = setTimeout(() => {
          wsRef.current?.close();
        }, 10_000);
      }, 30_000);

      if (roleRef.current === 'contestant' && sessionTokenRef.current && joinCodeRef.current) {
        setSession('REJOINING' as ContestantSessionState);
        ws.send(JSON.stringify({ event: 'join-room', data: { joinCode: joinCodeRef.current, sessionToken: sessionTokenRef.current } }));
      } else if (roleRef.current === 'host' && hostTokenRef.current) {
        setSession('CREATING');
        ws.send(JSON.stringify({ event: 'create-room', data: { matchState: {}, hostToken: hostTokenRef.current } }));
      }
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as RelayToClientEnvelope;

        if (msg.event === 'pong') {
          if (pongTimeoutRef.current) {
            clearTimeout(pongTimeoutRef.current);
            pongTimeoutRef.current = null;
          }
          return;
        }
        if (msg.event === 'ping') {
          return;
        }

        if (msg.event === 'room-joined' && 'sessionToken' in msg.data) {
          sessionTokenRef.current = msg.data.sessionToken;
          setSessionTokenState(msg.data.sessionToken);
        }
        if (msg.event === 'room-created' && 'hostToken' in msg.data) {
          hostTokenRef.current = msg.data.hostToken;
          setHostTokenState(msg.data.hostToken);
        }

        messageHandlerRef.current?.(msg);
      } catch {
        console.error('Failed to parse WebSocket message:', event.data);
      }
    };

    ws.onclose = () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (pongTimeoutRef.current) {
        clearTimeout(pongTimeoutRef.current);
        pongTimeoutRef.current = null;
      }
      if (wsRef.current === ws) {
        setTransport('DISCONNECTED');
        if (!intentionalCloseRef.current) {
          scheduleReconnect();
        }
      }
    };

    ws.onerror = () => {
      if (wsRef.current === ws) {
        setTransport('DISCONNECTED');
        ws.close();
      }
    };
  }, [scheduleReconnect]);

  const connect = useCallback(
    (newRole: Role) => {
      intentionalCloseRef.current = false;
      reconnectAttemptRef.current = 0;
      setRole(newRole);
      roleRef.current = newRole;
      doConnect();
    },
    [doConnect],
  );

  const disconnect = useCallback(() => {
    intentionalCloseRef.current = true;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    if (pongTimeoutRef.current) {
      clearTimeout(pongTimeoutRef.current);
      pongTimeoutRef.current = null;
    }
    reconnectAttemptRef.current = 0;
    wsRef.current?.close();
    wsRef.current = null;
    setTransport('DISCONNECTED');
    setSession('DISCONNECTED');
    setRole('none');
    setSessionTokenState(null);
    setHostTokenState(null);
    setJoinCodeState(null);
    setSlotStatusesState([]);
    sessionTokenRef.current = null;
    hostTokenRef.current = null;
    joinCodeRef.current = null;
  }, []);

  const sendEvent = useCallback((event: string, data: Record<string, unknown>): boolean => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event, data }));
      return true;
    }
    return false;
  }, []);

  const setRelayUrl = useCallback(
    (newUrl: string) => {
      localStorage.setItem('relayUrl', newUrl);
      relayUrlRef.current = newUrl;
      setRelayUrlState(newUrl);
      if (transportRef.current === 'CONNECTED' || transportRef.current === 'CONNECTING') {
        disconnect();
        intentionalCloseRef.current = false;
        reconnectAttemptRef.current = 0;
        doConnect();
      }
    },
    [disconnect, doConnect],
  );

  useEffect(() => {
    return () => {
      intentionalCloseRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (pongTimeoutRef.current) clearTimeout(pongTimeoutRef.current);
      wsRef.current?.close();
    };
  }, []);

  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState !== 'visible') return;
      const readyState = wsRef.current?.readyState;
      if (readyState === WebSocket.CLOSED || readyState === WebSocket.CLOSING) {
        intentionalCloseRef.current = false;
        reconnectAttemptRef.current = 0;
        doConnect();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [doConnect]);

  const connectionState = useMemo<ConnectionStateValue>(() => ({ transport, session, role }), [transport, session, role]);

  const ctx = useMemo<ConnectionContextValue>(
    () => ({
      connectionState,
      sendEvent,
      relayUrl: relayUrlState,
      setRelayUrl,
      sessionToken: sessionTokenState,
      hostToken: hostTokenState,
      joinCode: joinCodeState,
      slotStatuses: slotStatusesState,
      disconnect,
      connect,
      setMessageHandler,
      setSessionActive,
      setSessionJoining,
      setSessionJoined,
      setSessionCreating,
      setSessionDisconnected,
      setSessionRejoining,
      setJoinCode,
      setSlotStatuses,
      setSessionToken,
      setHostToken,
    }),
    [
      connectionState,
      sendEvent,
      relayUrlState,
      setRelayUrl,
      sessionTokenState,
      hostTokenState,
      joinCodeState,
      slotStatusesState,
      disconnect,
      connect,
      setMessageHandler,
      setSessionActive,
      setSessionJoining,
      setSessionJoined,
      setSessionCreating,
      setSessionDisconnected,
      setSessionRejoining,
      setJoinCode,
      setSlotStatuses,
      setSessionToken,
      setHostToken,
    ],
  );

  return <ConnectionContext.Provider value={ctx}>{children}</ConnectionContext.Provider>;
};

export function useConnection(): ConnectionContextValue {
  const ctx = useContext(ConnectionContext);
  if (!ctx) throw new Error('useConnection must be used within ConnectionProvider');
  return ctx;
}
