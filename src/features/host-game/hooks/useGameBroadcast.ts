import { useCallback } from 'react';
import type { RoundData, Rule } from '@/types/game.ts';
import type { ConnectionContextValue } from '@/contexts/ConnectionProvider.tsx';
import { useStableRef } from '@/shared/hooks/useStableRef.ts';

interface MatchState {
  players: Array<string>;
  rounds: Array<RoundData>;
  scores: Array<number>;
  rules: Array<Rule>;
  currentRound: number;
}

export function useGameBroadcast(
  conn: ConnectionContextValue,
  players: Array<string>,
  rounds: Array<RoundData>,
  scores: Array<number>,
  rules: Array<Rule>,
  currentRound: number,
) {
  const playersRef = useStableRef(players);
  const roundsRef = useStableRef(rounds);
  const scoresRef = useStableRef(scores);
  const currentRoundRef = useStableRef(currentRound);

  const buildPayload = useCallback((): MatchState => ({
    players: playersRef.current,
    rounds: roundsRef.current,
    scores: scoresRef.current,
    rules,
    currentRound: currentRoundRef.current,
  }), [rules, playersRef, roundsRef, scoresRef, currentRoundRef]);

  const broadcastState = useCallback(() => {
    conn.sendEvent('state-sync', { matchState: buildPayload() });
  }, [conn, buildPayload]);

  const sessionActive = conn.connectionState.session === 'ACTIVE';

  return { buildPayload, broadcastState, sessionActive, playersRef, roundsRef, scoresRef, currentRoundRef };
}
